import { MsGraphClientWrapper } from ".";
import {
  BookFileBlob,
  BookFileProps,
  BookFileThumbnail,
  SourceId,
  BookIdStr,
  FileId,
  BookSource,
} from "../../core";
import { DateUtil, Result, ok, err } from "../../util";

export class OneDriveBookSource implements BookSource {
  constructor(private readonly client: MsGraphClientWrapper) {}

  /**
   * Get source id.
   */
  getSourceId(): SourceId {
    return "onedrive";
  }

  /**
   * Scan all target files.
   */
  async scanAllFiles(): Promise<
    Result<Record<BookIdStr, BookFileProps>, "offline">
  > {
    const r = await this.client.getBookFiles(this.getSourceId());
    if (r.err) return err("offline");
    return r;
  }

  /**
   * Load book blob.
   *
   * @param fileId Target file id.
   */
  async loadBlob(
    fileId: FileId
  ): Promise<Result<BookFileBlob, "offline" | "not exists">> {
    const bookId = { source: this.getSourceId(), file: fileId };
    const r = await this.client.downloadBookBlob(bookId);
    if (r.err) return err("not exists");
    return ok(r.val);
  }

  /**
   * Load book thumbnail.
   *
   * @param fileId Target file id.
   */
  async loadThumbnail(
    fileId: FileId
  ): Promise<Result<BookFileThumbnail, "offline" | "not exists">> {
    const bookId = { source: this.getSourceId(), file: fileId };
    const r = await this.client.downloadBookThumbnail(bookId);
    if (r.err) return err("not exists");
    return ok(r.val);
  }
}
