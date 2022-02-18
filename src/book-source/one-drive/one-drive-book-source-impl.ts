import { Result, ok, err } from "../../results";
import {
  BookId,
  bookIdToStr,
  bookNotExistsInSourceError,
  BookRecord,
  CommonOnlineError,
  DirectoryId,
  FileId,
  OnlineBookError,
  OnlineSourceError,
  ScanTargetDirectory,
  somethingWrongError,
  SourceId,
} from "../../core";
import {
  FileContent,
  FileProps,
  FileThumbnail,
  LoadProgressCallback,
  OnlineConfigRepository,
} from "../../core/interfaces";
import {
  MsalInstanceType,
  OneDriveDirectoryId,
} from "../../use-cases/book-sources/one-drive";
import { MsGraphClientUtil } from "./interfaces/ms-graph-client-util";
import {
  epubMimeType,
  getDriveId,
  getItemId,
  isFile,
  isFolder,
  msalInstanceAccountToSourceId,
  pdfMimeType,
  rootDirectoryName,
  rootSharedDirectoryName,
} from "./util";
import {
  driveItemIdToFileId,
  fileIdToDriveItemId,
} from "./ms-graph-client/file-id-and-drive-item-id-converter";
import { MsGraphClientWrapperFactory } from "./interfaces";
import { OneDriveItemNotExistsError } from "./one-drive-error";
import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../../inject-tokens";
import { MsalInstanceRepository } from "../../use-cases/book-sources/one-drive/interfaces";
import { OneDriveBookSource } from "../interfaces";

@singleton()
@injectable()
export class OneDriveBookSourceImpl implements OneDriveBookSource {
  private readonly msalInstance: MsalInstanceType;

  constructor(
    private readonly clientFactory: MsGraphClientWrapperFactory,
    @inject(it.MsGraphClientUtil)
    private readonly clientUtil: MsGraphClientUtil,
    @inject(it.MsalInstanceRepository)
    msalRepo: MsalInstanceRepository,
    private readonly configRepo: OnlineConfigRepository
  ) {
    this.msalInstance = msalRepo.get();
  }

  /**
   * Get all available sources.
   */
  async getAllAvailableBookSourceIds(): Promise<SourceId[]> {
    return this.msalInstance
      .getAllAccounts()
      .map(msalInstanceAccountToSourceId);
  }

  /**
   * Scan all target files and deal file props.
   * Contents and thumbnails are not dealt.
   *
   * @param source Target source id.
   */
  async scanAllFiles(
    source: SourceId
  ): Promise<Result<BookRecord<FileProps>, OnlineSourceError>> {
    const client = this.clientFactory.getClientWrapper(
      source,
      this.msalInstance
    );
    if (client.err) return client;

    const config = await this.configRepo.loadConfig(source);
    if (config.err) return config;

    const ignoreFolderNameSet = new Set(
      config.val.ignoreFolderNames.map((s) => s.toLowerCase())
    );
    const folderNameFilter = (name: string) => {
      if (name.startsWith(".")) return false;
      if (ignoreFolderNameSet.has(name.toLowerCase())) return false;
      return true;
    };

    const scanRootDirectories =
      config.val.targetRootDirectories.length === 0
        ? defaultScanRoot
        : config.val.targetRootDirectories;
    const scannedItemsNested = await Promise.all(
      scanRootDirectories.map(async (d) => {
        const r = await this.clientUtil.scanItemsUnderFolder(
          client.val,
          d.directoryId as OneDriveDirectoryId,
          folderNameFilter
        );
        if (r.err) return [];
        return r.val;
      })
    );
    const scannedFiles = scannedItemsNested.flat().filter(isFile);

    // pdf
    const scannedFilesPdf = scannedFiles.filter(
      (f) => f.file.mimeType === pdfMimeType
    );
    const pdfFileProps: FileProps[] = scannedFilesPdf.map((f) => ({
      id: {
        source,
        file: driveItemIdToFileId(getDriveId(f), getItemId(f)),
      },
      type: "pdf",
      title: undefined,
      author: undefined,
      fileName: f.name,
      path: (f.parentReference ?? { path: "" }).path,
      givenTags: [],
      lastModifiedDate: f.lastModifiedDateTime,
    }));

    // epub
    const scannedFilesEpub = scannedFiles.filter(
      (f) => f.file.mimeType === epubMimeType
    );
    const epubFileProps: FileProps[] = scannedFilesEpub.map((f) => ({
      id: {
        source,
        file: driveItemIdToFileId(getDriveId(f), getItemId(f)),
      },
      type: "epub",
      title: undefined,
      author: undefined,
      fileName: f.name,
      path: (f.parentReference ?? { path: "" }).path,
      givenTags: [],
      lastModifiedDate: f.lastModifiedDateTime,
    }));

    const fileProps = [...pdfFileProps, ...epubFileProps];
    return ok(Object.fromEntries(fileProps.map((f) => [bookIdToStr(f.id), f])));
  }

  /**
   * Load file content.
   *
   * @param bookId Target book id.
   * @param loadProgressCallback Emit download progress.
   */
  async loadContent(
    bookId: BookId,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<FileContent, OnlineBookError>> {
    const sourceId = bookId.source;
    const client = this.clientFactory.getClientWrapper(
      sourceId,
      this.msalInstance
    );
    if (client.err) return client;

    const fileId = bookId.file;
    const [driveId, itemId] = fileIdToDriveItemId(fileId);
    const item = await client.val.downloadItemAsDataUri(
      driveId,
      itemId,
      loadProgressCallback
    );
    if (item.err) {
      if (!isOneDriveItemError(item.val)) return err(item.val);
      return err(bookNotExistsInSourceError(bookId));
    }
    const [itemProps, dataUri] = item.val;
    const fileType =
      itemProps.file.mimeType === pdfMimeType
        ? "pdf"
        : itemProps.file.mimeType === epubMimeType
        ? "epub"
        : undefined;
    if (fileType === undefined) return err(bookNotExistsInSourceError(bookId));
    return ok({
      id: bookId,
      type: fileType,
      fileSizeByte: itemProps.size,
      lastModifiedDate: itemProps.lastModifiedDateTime,
      dataUri,
    });
  }

  /**
   * Load file thumbnail.
   *
   * @param bookId Target book id.
   */
  async loadThumbnail(
    bookId: BookId
  ): Promise<Result<FileThumbnail, OnlineBookError>> {
    const sourceId = bookId.source;
    const client = this.clientFactory.getClientWrapper(
      sourceId,
      this.msalInstance
    );
    if (client.err) return client;

    const fileId = bookId.file;
    const [driveId, itemId] = fileIdToDriveItemId(fileId);
    const item = await client.val.downloadThumbnailAsDataUri(driveId, itemId);
    if (item.err) {
      if (!isOneDriveItemError(item.val)) return err(item.val);
      return err(bookNotExistsInSourceError(bookId));
    }
    const [itemProps, dataUri] = item.val;
    return ok({
      id: bookId,
      fileSizeByte: itemProps.size,
      lastModifiedDate: itemProps.lastModifiedDateTime,
      dataUri,
    });
  }

  /**
   * Load Top directories.
   */
  async loadTopDirectories(
    source: SourceId
  ): Promise<Result<ScanTargetDirectory[], CommonOnlineError>> {
    const topDir: ScanTargetDirectory<OneDriveDirectoryId> = {
      displayPath: rootDirectoryName,
      directoryId: { type: "topMyItems" },
    };
    const sharedDir: ScanTargetDirectory<OneDriveDirectoryId> = {
      displayPath: rootSharedDirectoryName,
      directoryId: { type: "topShared" },
    };
    return ok([topDir, sharedDir]);
  }

  /**
   * Load children directories.
   *
   * @param parentDirId Parent directory.
   */
  async loadChildrenDirectories(
    source: SourceId,
    parentDirId: DirectoryId
  ): Promise<Result<ScanTargetDirectory[], OnlineBookError>> {
    const client = this.clientFactory.getClientWrapper(
      source,
      this.msalInstance
    );
    if (client.err) return client;

    const config = await this.configRepo.loadConfig(source);
    if (config.err) return config;

    const ignoreFolderNameSet = new Set(
      config.val.ignoreFolderNames.map((s) => s.toLowerCase())
    );
    const folderNameFilter = (name: string) => {
      if (name.startsWith(".")) return false;
      if (ignoreFolderNameSet.has(name.toLowerCase())) return false;
      return true;
    };

    const children = await this.clientUtil.getFolderChildrenItems(
      client.val,
      parentDirId as OneDriveDirectoryId,
      folderNameFilter
    );
    if (children.err) {
      if (!isOneDriveItemError(children.val)) return err(children.val);
      return err(somethingWrongError("Bad directory id"));
    }
    const childrenFolders = children.val.filter(isFolder);
    return ok(
      childrenFolders
        .filter((f) => "parentReference" in f)
        .map<ScanTargetDirectory<OneDriveDirectoryId>>((f) => ({
          displayPath: f.parentReference!.path,
          directoryId: {
            type: "folder",
            driveId: f.parentReference!.driveId,
            itemId: f.id,
          },
        }))
    );
  }

  async getDirectoryDisplayPath(
    source: SourceId,
    dirId: DirectoryId
  ): Promise<Result<string, OnlineBookError>> {
    const dirId2 = dirId as OneDriveDirectoryId;
    const client = this.clientFactory.getClientWrapper(
      source,
      this.msalInstance
    );
    if (client.err) return client;

    if (dirId2.type === "topMyItems") {
      return ok(rootDirectoryName);
    }
    if (dirId2.type === "topShared") {
      return ok(rootSharedDirectoryName);
    }
    const r = await client.val.getItem(dirId2.driveId, dirId2.itemId);
    if (r.err) {
      if (!isOneDriveItemError(r.val)) return err(r.val);
      return err(somethingWrongError("Bad directory id"));
    }
    return ok(r.val.parentReference?.path ?? "");
  }
}

const isOneDriveItemError = (v: {
  type: string;
}): v is OneDriveItemNotExistsError => v.type === "onedrive item not exists";

const defaultScanRoot: ScanTargetDirectory<OneDriveDirectoryId>[] = [
  {
    displayPath: rootDirectoryName,
    directoryId: {
      type: "topMyItems",
    },
  },
  {
    displayPath: rootSharedDirectoryName,
    directoryId: {
      type: "topShared",
    },
  },
];
