import { Client } from "@microsoft/microsoft-graph-client";
import {
  BookFileBlob,
  BookFileProps,
  BookFileThumbnail,
  BookId,
  BookIdStr,
  bookIdToStr,
  SourceId,
} from "../../core";
import { DateUtil, Result, ok, err } from "../../util";
import {
  scanAllItems,
  downloadItemAsDataUri,
  downloadThumbnailAsDataUri,
} from "./client-util";

export interface MsGraphClientWrapper {
  getBookFiles(
    sourceId: SourceId
  ): Promise<Result<Record<BookIdStr, BookFileProps>>>;

  downloadBookThumbnail(bookId: BookId): Promise<Result<BookFileThumbnail>>;

  downloadBookBlob(bookId: BookId): Promise<Result<BookFileBlob>>;
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

const base64FileSize = (base64File: string) => {
  // https://softwareengineering.stackexchange.com/questions/288670/know-file-size-with-a-base64-string
  const sizeOffset = base64File.endsWith("==") ? 2 : 1;
  return base64File.length * (3 / 4) - sizeOffset;
};

export class MsGraphClientWrapperImpl implements MsGraphClientWrapper {
  private readonly ignoreFolderNames: ReadonlySet<string>;

  constructor(
    private readonly dateUtil: DateUtil,
    private readonly client: Client,
    ignoreFolderNames: string[]
  ) {
    this.ignoreFolderNames = new Set(
      ignoreFolderNames.map((s) => s.toLowerCase())
    );
  }

  async getBookFiles(
    sourceId: SourceId
  ): Promise<Result<Record<BookIdStr, BookFileProps>>> {
    const items = await scanAllItems(this.client, this.ignoreFolderNames);
    if (items.err) return items;

    const data: [BookIdStr, BookFileProps][] = items.val
      .filter((v) => "file" in v && v.file.mimeType === "application/pdf")
      .map((v) => [
        bookIdToStr({ source: sourceId, file: v.id }),
        {
          id: { source: sourceId, file: v.id },
          type: "pdf",
          title: v.name,
          path: trimOneDrivePath(
            v.parentReference ? v.parentReference.path : ""
          ),
        },
      ]);

    return ok(Object.fromEntries(data));
  }

  async downloadBookThumbnail(
    bookId: BookId
  ): Promise<Result<BookFileThumbnail>> {
    const values = bookId.file.split("!");
    if (values.length !== 2) {
      return err("misc");
    }
    const driveId = values[0];
    const itemId = bookId.file;
    const r = await downloadThumbnailAsDataUri(this.client, driveId, itemId);
    if (r.err) return r;

    const now = this.dateUtil.now();
    return ok({
      id: bookId,
      lastLoadedDate: now,
      type: "pdf",
      fileSizeByte: base64FileSize(r.val),
      blob: r.val,
    });
  }

  async downloadBookBlob(bookId: BookId): Promise<Result<BookFileBlob>> {
    const values = bookId.file.split("!");
    if (values.length !== 2) {
      return err("misc");
    }
    const driveId = values[0];
    const itemId = bookId.file;
    const r = await downloadItemAsDataUri(this.client, driveId, itemId);
    if (r.err) return r;

    const now = this.dateUtil.now();
    return ok({
      id: bookId,
      lastLoadedDate: now,
      type: "pdf",
      fileSizeByte: base64FileSize(r.val),
      blob: r.val,
    });
  }
}
