import { singleton, injectable } from "tsyringe";
import { MsGraphClientType, OneDriveItemDetail } from "./types";
import {
  BookSource,
  bookIdToStr,
  SourceId,
  BookIdStr,
  BookFileProps,
  FileId,
  BookFileBlob,
  BookFileThumbnail,
} from "../../core";
import { err, Result, isOk, ok, DateUtil } from "../../util";
import { decodeOneDriveFileId } from "./util";

export interface OneDriveLoginIdGetter {
  getLoginId(): Result<string, "offline">;
}

export interface OneDriveItemScanner {
  scanItemsUnderFolder(
    client: MsGraphClientType,
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItemDetail[], "offline" | "not exists">>;
}

export interface OneDriveDownloader {
  downloadItem(
    client: MsGraphClientType,
    driveId: string,
    itemId: string
  ): Promise<Result<string, "offline" | "not exists">>;

  downloadThumbnail(
    client: MsGraphClientType,
    driveId: string,
    itemId: string
  ): Promise<Result<string, "offline" | "not exists">>;
}

export type OneDriveBookSourceConfig = {
  ignoreFolderNames: string[];
  scanFolderRoots: [string, string][]; // [driveId, itemId] of folder
};

@singleton()
@injectable()
export class OneDriveBookSource implements BookSource {
  private readonly ignoreNameSet: Set<string>;

  constructor(
    private readonly config: OneDriveBookSourceConfig,
    private readonly client: MsGraphClientType,
    private readonly loginIdGetter: OneDriveLoginIdGetter,
    private readonly date: DateUtil,
    private readonly scanner: OneDriveItemScanner,
    private readonly downloader: OneDriveDownloader
  ) {
    this.ignoreNameSet = new Set(this.config.ignoreFolderNames);
  }

  /**
   * Get source id.
   */
  getSourceId(): SourceId {
    const loginId = this.loginIdGetter.getLoginId();
    if (loginId.err) throw new Error("Not login");
    return `onedrive ${loginId.val}`;
  }

  /**
   * Scan all target files.
   */
  async scanAllFiles(): Promise<
    Result<Record<BookIdStr, BookFileProps>, "offline">
  > {
    const filter = (folderName: string): boolean => {
      if (this.ignoreNameSet.has(folderName)) return false;
      if (folderName.startsWith(".")) return false;
      return true;
    };
    const p = this.config.scanFolderRoots.map(([driveId, itemId]) =>
      this.scanner.scanItemsUnderFolder(this.client, driveId, itemId, filter)
    );
    const rs = await Promise.all(p);
    for (const r of rs) {
      if (r.err) return err("offline");
    }
    const items = rs
      .filter(isOk)
      .map((v) => v.val)
      .flat();

    const sourceId = this.getSourceId();
    const data: [BookIdStr, BookFileProps][] = items
      .filter((v) => "file" in v && v.mimeType === "application/pdf")
      .map((v) => [
        bookIdToStr({ source: sourceId, file: v.itemId }),
        {
          id: { source: sourceId, file: v.itemId },
          type: "pdf",
          title: v.name,
          path: trimOneDrivePath(v.path),
        },
      ]);
    return ok(Object.fromEntries(data));
  }

  /**
   * Load book blob.
   *
   * @param fileId Target file id.
   */
  async loadBlob(
    fileId: FileId
  ): Promise<Result<BookFileBlob, "offline" | "not exists">> {
    const { driveId, itemId } = decodeOneDriveFileId(fileId);
    const itemAsUri = await this.downloader.downloadItem(
      this.client,
      driveId,
      itemId
    );

    if (itemAsUri.err) return itemAsUri;

    const bookId = { file: fileId, source: this.getSourceId() };
    const now = this.date.now();
    return ok({
      id: bookId,
      lastLoadedDate: now,
      type: "pdf",
      fileSizeByte: dataUriSize(itemAsUri.val),
      blob: itemAsUri.val,
    });
  }

  /**
   * Load book thumbnail.
   *
   * @param fileId Target file id.
   */
  async loadThumbnail(
    fileId: FileId
  ): Promise<Result<BookFileThumbnail, "offline" | "not exists">> {
    const { driveId, itemId } = decodeOneDriveFileId(fileId);
    const itemAsUri = await this.downloader.downloadThumbnail(
      this.client,
      driveId,
      itemId
    );

    if (itemAsUri.err) return itemAsUri;

    const bookId = { file: fileId, source: this.getSourceId() };
    const now = this.date.now();
    return ok({
      id: bookId,
      lastLoadedDate: now,
      type: "pdf",
      fileSizeByte: dataUriSize(itemAsUri.val),
      blob: itemAsUri.val,
    });
  }
}

@singleton()
export class GetOneDriveBookSource {
  constructor(
    private readonly date: DateUtil,
    private readonly scanner: OneDriveItemScanner,
    private readonly downloader: OneDriveDownloader
  ) {}

  run(
    config: OneDriveBookSourceConfig,
    client: MsGraphClientType,
    loginIdGetter: OneDriveLoginIdGetter
  ): BookSource {
    return new OneDriveBookSource(
      config,
      client,
      loginIdGetter,
      this.date,
      this.scanner,
      this.downloader
    );
  }
}

const trimOneDrivePath = (path: string) => {
  const splittedPath = path.split("/").map((v) => decodeURIComponent(v));
  let splittedNewPath: string[] = [];
  for (const p of splittedPath.reverse()) {
    if (p.endsWith(":")) break;
    splittedNewPath = [p, ...splittedNewPath];
  }
  return splittedNewPath.join("/");
};

const dataUriSize = (dataUri: string) => {
  // https://softwareengineering.stackexchange.com/questions/288670/know-file-size-with-a-base64-string
  const [_, ...base64Parts] = dataUri.split(",");
  const base64Part = base64Parts.join("");
  const sizeOffset = base64Part.endsWith("==") ? 2 : 1;
  return base64Part.length * (3 / 4) - sizeOffset;
};
