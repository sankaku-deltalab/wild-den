import { Result, ok, err } from "../../results";
import {
  bookIdToStr,
  bookNotExistsInSourceError,
  BookRecord,
  BookSource,
  CommonOnlineError,
  FileContent,
  FileId,
  FileProps,
  FileThumbnail,
  LoadProgressCallback,
  OnlineBookError,
  OnlineBookSourceConfigRepository,
  ScanTargetDirectory,
  somethingWrongError,
  SourceId,
} from "../../core";
import { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";
import { MsGraphClientUtil } from "./interfaces/ms-graph-client-util";
import {
  epubMimeType,
  isFile,
  isFolder,
  pdfMimeType,
  rootDirectoryName,
  rootSharedDirectoryName,
} from "./util";
import { fileIdToDriveItemId } from "./ms-graph-client/file-id-and-drive-item-id-converter";
import { MsGraphClientWrapper } from "./interfaces";
import { OneDriveItemNotExistsError } from "./one-drive-error";

export class OneDriveBookSource implements BookSource<OneDriveDirectoryId> {
  constructor(
    private readonly sourceId: SourceId,
    private readonly client: MsGraphClientWrapper,
    private readonly clientUtil: MsGraphClientUtil,
    private readonly configRepo: OnlineBookSourceConfigRepository<OneDriveDirectoryId>
  ) {}

  getSourceId(): SourceId {
    return this.sourceId;
  }

  /**
   * Scan all target files and deal file props.
   * Contents and thumbnails are not dealt.
   */
  async scanAllFiles(): Promise<
    Result<BookRecord<FileProps>, CommonOnlineError>
  > {
    const config = await this.configRepo.loadConfig();
    if (config.err) return config;

    const ignoreFolderNameSet = new Set(
      config.val.ignoreFolderNames.map((s) => s.toLowerCase())
    );
    const folderNameFilter = (name: string) => {
      if (name.startsWith(".")) return false;
      if (ignoreFolderNameSet.has(name.toLowerCase())) return false;
      return true;
    };

    const scannedItemsNested = await Promise.all(
      config.val.targetRootDirectories.map(async (d) => {
        const r = await this.clientUtil.scanItemsUnderFolder(
          this.client,
          d.directoryId,
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
      id: { source: this.sourceId, file: f.id },
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
      id: { source: this.sourceId, file: f.id },
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
   * @param fileId Target file id.
   * @param loadProgressCallback Emit download progress.
   */
  async loadContent(
    fileId: FileId,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<FileContent, OnlineBookError>> {
    const sourceId = this.sourceId;
    const bookId = { source: sourceId, file: fileId };
    const [driveId, itemId] = fileIdToDriveItemId(fileId);
    const item = await this.client.downloadItemAsDataUri(
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
   * @param fileId Target file id.
   */
  async loadThumbnail(
    fileId: FileId
  ): Promise<Result<FileThumbnail, OnlineBookError>> {
    const sourceId = this.sourceId;
    const bookId = { source: sourceId, file: fileId };
    const [driveId, itemId] = fileIdToDriveItemId(fileId);
    const item = await this.client.downloadThumbnailAsDataUri(driveId, itemId);
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
  async loadTopDirectories(): Promise<
    Result<ScanTargetDirectory<OneDriveDirectoryId>[], CommonOnlineError>
  > {
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
    parentDirId: OneDriveDirectoryId
  ): Promise<
    Result<ScanTargetDirectory<OneDriveDirectoryId>[], OnlineBookError>
  > {
    const config = await this.configRepo.loadConfig();
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
      this.client,
      parentDirId,
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
    dirId: OneDriveDirectoryId
  ): Promise<Result<string, OnlineBookError>> {
    if (dirId.type === "topMyItems") {
      return ok(rootDirectoryName);
    }
    if (dirId.type === "topShared") {
      return ok(rootSharedDirectoryName);
    }
    const r = await this.client.getItem(dirId.driveId, dirId.itemId);
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
