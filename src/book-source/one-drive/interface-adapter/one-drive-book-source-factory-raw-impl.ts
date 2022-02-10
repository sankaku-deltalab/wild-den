import { inject, injectable, singleton } from "tsyringe";
import { Result, ok, err } from "../../../results";
import {
  bookIdToStr,
  BookProps,
  BookRecord,
  BookSource,
  CommonOnlineError,
  FileContent,
  FileId,
  FileProps,
  FileThumbnail,
  LoadProgressCallback,
  OnlineBookDataRepository,
  OnlineBookError,
  ScanTargetDirectory,
  SourceId,
} from "../../../core";
import {
  GetOneDriveBookSourcesFactoryRaw,
  MsalInstanceType,
  OneDriveDirectoryId,
  OneDriveConfig,
  OneDriveConfigRepository,
} from "../../../use-cases/book-sources/one-drive";
import { injectTokens as it } from "../../../inject-tokens";
import { MsGraphClientUtil } from "./ms-graph-client-util";
import { MsGraphClientWrapper } from "./types";
import { isFile, isFolder } from "./util";
import { fileIdToDriveItemId } from "../framework/file-id-and-drive-item-id-converter";

export interface MsGraphClientWrapperFactory {
  getClientWrappers(
    msalInstance: MsalInstanceType
  ): Record<SourceId, MsGraphClientWrapper>;
}

const pdfMimeType = "application/pdf";
const epubMimeType = "application/epub+zip";

const rootDirectoryName = "root:";
const rootSharedDirectoryName = "shared:";

@singleton()
@injectable()
export class GetOneDriveBookSourcesFactoryRawImpl
  implements GetOneDriveBookSourcesFactoryRaw
{
  constructor(
    @inject(it.MsGraphClientWrapperFactory)
    private readonly clientWrapperFactory: MsGraphClientWrapperFactory,
    @inject(it.MsGraphClientUtil)
    private readonly clientUtil: MsGraphClientUtil
  ) {}

  async getAvailableBookSources(
    msalInstance: MsalInstanceType,
    configRepository: OneDriveConfigRepository
  ): Promise<
    Record<
      SourceId,
      {
        source: BookSource;
        repository: OnlineBookDataRepository;
      }
    >
  > {
    const wrappers = this.clientWrapperFactory.getClientWrappers(msalInstance);

    const sources: [
      SourceId,
      {
        source: BookSource;
        repository: OnlineBookDataRepository;
      }
    ][] = [];
    const addSources = Object.entries(wrappers).map(async ([sid, wrapper]) => {
      const config = await configRepository.loadConfig(sid);
      if (config.err) return;
      const source = new OneDriveBookSource(
        sid,
        wrapper,
        this.clientUtil,
        config.val
      );
      const repository: OnlineBookDataRepository = new OneDriveOnlineRepository(
        sid,
        wrapper,
        this.clientUtil
      );
      sources.push([sid, { source, repository }]);
    });
    await Promise.all(addSources);
    return Object.fromEntries(sources);
  }
}

class OneDriveBookSource implements BookSource<OneDriveDirectoryId> {
  constructor(
    private readonly sourceId: SourceId,
    private readonly client: MsGraphClientWrapper,
    private readonly clientUtil: MsGraphClientUtil,
    private readonly config: {
      targetRootDirectories: ScanTargetDirectory<OneDriveDirectoryId>[];
      ignoreFolderNames: string[];
    }
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
    const ignoreFolderNameSet = new Set(
      this.config.ignoreFolderNames.map((s) => s.toLowerCase())
    );
    const folderNameFilter = (name: string) => {
      if (name.startsWith(".")) return false;
      if (ignoreFolderNameSet.has(name.toLowerCase())) return false;
      return true;
    };

    const scannedItemsNested = await Promise.all(
      this.config.targetRootDirectories.map(async (d) => {
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
    const [driveId, itemId] = fileIdToDriveItemId(fileId);
    const item = await this.client.downloadItemAsDataUri(
      driveId,
      itemId,
      loadProgressCallback
    );
    if (item.err) return item;
    const [itemProps, dataUri] = item.val;
    const fileType =
      itemProps.file.mimeType === pdfMimeType
        ? "pdf"
        : itemProps.file.mimeType === epubMimeType
        ? "epub"
        : undefined;
    if (fileType === undefined) return err("not exists");
    return ok({
      id: { source: sourceId, file: fileId },
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
    const [driveId, itemId] = fileIdToDriveItemId(fileId);
    const item = await this.client.downloadThumbnailAsDataUri(driveId, itemId);
    if (item.err) return item;
    const [itemProps, dataUri] = item.val;
    return ok({
      id: { source: sourceId, file: fileId },
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
    const ignoreFolderNameSet = new Set(
      this.config.ignoreFolderNames.map((s) => s.toLowerCase())
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
    if (children.err) return children;
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
    if (r.err) return r;
    return ok(r.val.parentReference?.path ?? "");
  }
}

// TODO: impl this.
export class OneDriveOnlineRepository
  implements OnlineBookDataRepository<OneDriveDirectoryId>
{
  constructor(
    private readonly sourceId: SourceId,
    private readonly client: MsGraphClientWrapper,
    private readonly clientUtil: MsGraphClientUtil
  ) {}

  getSourceId(): SourceId {
    return this.sourceId;
  }

  async loadStoredBookProps(): Promise<
    Result<BookRecord<BookProps>, CommonOnlineError>
  > {
    return ok({});
  }

  async storeBookProps(
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>> {
    return ok(undefined);
  }

  async loadTargetDirectories(): Promise<
    Result<OneDriveDirectoryId[], CommonOnlineError>
  > {
    return ok([]);
  }

  async storeTargetDirectories(
    directories: OneDriveDirectoryId[]
  ): Promise<Result<void, CommonOnlineError>> {
    return ok(undefined);
  }
}
