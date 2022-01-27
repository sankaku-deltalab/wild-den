import {
  BookSource,
  BookFileProps,
  BookIdStr,
  SourceId,
  FileId,
  BookFileThumbnail,
  BookFileBlob,
  bookIdToStr,
  Result,
  ok,
  err,
} from "../src";

export class BookSourceMock implements BookSource {
  getSourceId(): SourceId {
    return "__mock_source__";
  }

  async scanAllFiles(): Promise<
    Result<Record<BookIdStr, BookFileProps>, "offline">
  > {
    const sourceId = this.getSourceId();
    const files: BookFileProps[] = [
      {
        id: { source: sourceId, file: "__mock_file_1" },
        type: "pdf",
        title: "Alice's Adventures in Wonderland",
        author: "lewis",
        fileName: "alice_in_wonderland.pdf",
        path: "book/lewis/alice",
      },
      {
        id: { source: sourceId, file: "__mock_file_2" },
        type: "pdf",
        title: "Through the Looking-Glass, and What Alice Found There",
        author: "lewis",
        fileName: "alice_in_looking_grass.pdf",
        path: "book/lewis",
      },
    ];
    return ok(Object.fromEntries(files.map((p) => [bookIdToStr(p.id), p])));
    return err("offline");
  }

  async loadBlob(
    fileId: FileId
  ): Promise<Result<BookFileBlob, "offline" | "not exists">> {
    const sourceId = this.getSourceId();
    if (fileId === "__mock_file_1") {
      return ok({
        id: { source: sourceId, file: "__mock_file_1" },
        lastLoadedDate: new Date().toISOString(),
        type: "pdf",
        fileSizeByte: 1,
        blob: "alice_in_wonderland_blob",
      });
    }
    if (fileId === "__mock_file_2") {
      return ok({
        id: { source: sourceId, file: "__mock_file_2" },
        lastLoadedDate: new Date().toISOString(),
        type: "pdf",
        fileSizeByte: 1,
        blob: "alice_in_looking_grass_blob",
      });
    }

    return err("not exists");
  }

  async loadThumbnail(
    fileId: FileId
  ): Promise<Result<BookFileThumbnail, "offline" | "not exists">> {
    const sourceId = this.getSourceId();
    if (fileId === "__mock_file_1") {
      return ok({
        id: { source: sourceId, file: "__mock_file_1" },
        lastLoadedDate: new Date().toISOString(),
        type: "pdf",
        fileSizeByte: 1,
        blob: "alice_in_wonderland_thumbnail",
      });
    }
    if (fileId === "__mock_file_2") {
      return ok({
        id: { source: sourceId, file: "__mock_file_2" },
        lastLoadedDate: new Date().toISOString(),
        type: "pdf",
        fileSizeByte: 1,
        blob: "alice_in_looking_grass_thumbnail",
      });
    }

    return err("not exists");
  }
}
