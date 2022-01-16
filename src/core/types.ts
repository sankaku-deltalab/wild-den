import { Result } from "ts-results";

/** Id of book file. */
export type FileId = string;

/** Id of book source. */
export type SourceId = string;

/** Id of book. */
export type BookId = { source: SourceId; file: FileId };

/** Json encoded `BookId`. */
export type BookIdStr = string;

/** Book type. */
export type BookType = "pdf" | "epub";

/**
 * This contain props of file.
 * This would be loaded from any sources.
 */
export type BookFileProps = {
  id: BookId;
  type: BookType;
  title?: string;
  author?: string;
  fileName?: string;
  path?: string;
};

/**
 * This contain blob of file.
 */
export type BookFileBlob = {
  id: BookId;
  lastLoadedDate: string;
  type: BookType;
  fileSizeByte: number;
  blob: string;
};

/**
 * This contain thumbnail blob of file.
 */
export type BookFileThumbnail = {
  id: BookId;
  lastLoadedDate: string;
  type: BookType;
  fileSizeByte: number;
  blob: string;
};

/** Book reading state. */
export type ReadState = "new" | "reading" | "anytime" | "completed";

/**
 * This is user-editable book props based on `BookFileProps`.
 */
export type BookProps = {
  id: BookId;
  lastLoadedDate: string;
  type: BookType;
  title: string;
  author: string;
  tags: string[];
  hidden: boolean;
  lastReadDate: string;
  readState: ReadState;
};

/**
 * Interface of OneDrive, Dropbox and misc.
 */
export interface BookSource {
  /**
   * Get source id.
   */
  getSourceId(): SourceId;

  /**
   * Scan all target files.
   */
  scanAllFiles(): Promise<Result<Record<BookIdStr, BookFileProps>, "offline">>;

  /**
   * Load book blob.
   *
   * @param fileId Target file id.
   */
  loadBlob(
    fileId: FileId
  ): Promise<Result<BookFileBlob | undefined, "offline" | "not exists">>;

  /**
   * Load book thumbnail.
   *
   * @param fileId Target file id.
   */
  loadThumbnail(
    fileId: FileId
  ): Promise<Result<BookFileThumbnail | undefined, "offline" | "not exists">>;
}

/**
 * Contain caches of books.
 */
export interface BookCacheRepository {
  /**
   * Delete all cache.
   */
  clean(): void;

  /**
   * Reset book props from one source.
   * If exists `BookFileBlob` and `BookFileThumbnail` id is not in given props,
   * then delete these caches.
   *
   * @param source Resetting source.
   * @param allProps New all props.
   */
  resetSource(source: BookSource, allProps: BookProps[]): void;

  /**
   * Get All `BookProps`.
   */
  getAllBookProps(): Record<BookIdStr, BookProps>;

  /**
   * Get one `BookProps`.
   *
   * @param id Getting book id.
   */
  getBookProps(id: BookId): Result<BookProps, "not exists">;

  /**
   * Set a `BookProps`.
   *
   * @param props New `BookProps`.
   */
  setBookProps(props: BookProps): void;

  /**
   * Get a `BookFileThumbnail`.
   *
   * @param id Getting `BookFileThumbnail`.
   */
  getThumbnail(id: BookId): Result<BookFileThumbnail, "not exists">;

  /**
   * Set a `BookFileThumbnail`.
   *
   * @param thumbnail New `BookFileThumbnail`.
   */
  setThumbnail(thumbnail: BookFileThumbnail): void;

  /**
   * Delete a `BookFileThumbnail`.
   *
   * @param id Deleting `BookFileThumbnail`.
   */
  deleteThumbnail(id: BookId): void;

  /**
   * Get a `BookFileBlob`.
   *
   * @param id Getting `BookFileBlob`.
   */
  getBlob(id: BookId): Result<BookFileBlob, "not exists">;

  /**
   * Set a `BookFileBlob`.
   *
   * @param blob New `BookFileBlob`.
   */
  setBlob(blob: BookFileBlob): void;

  /**
   * Delete a `BookFileBlob`.
   *
   * @param id Deleting `BookFileBlob`.
   */
  deleteBlob(id: BookId): void;
}
