import { DateTime } from "../util";

/** Id of book file. */
export type FileId = string;

export type SourceType = "OneDrive";

/** Id of book source. */
export type SourceId = { sourceType: SourceType; id: string };

/** Json encoded `SourceId`. */
export type SourceIdStr = string;

/** Id of book. */
export type BookId = { source: SourceId; file: FileId };

/** Json encoded `BookId`. */
export type BookIdStr = string;

/** Book type. */
export type BookType = "pdf" | "epub";

/** Book reading state. */
export type ReadingState = "new" | "reading" | "anytime" | "completed";

export type DataUri = string;

export type BookRecord<T> = Record<BookIdStr, T>;

/** Directory id of `BookSource`. Each `BookSource` has each directory id format. */
export type DirectoryId = Record<string, unknown>;

/**
 * User-editable book props.
 *
 * - Saved to `BookSource` and `LocalBookRepository`.
 */
export type BookProps = {
  id: BookId;
  lastModifiedDate: DateTime;
  lastFileModifiedDate: DateTime;
  type: BookType;
  title: string;
  author: string;
  autoTags: BookAutoTag[];
  manualTags: string[];
  hiddenAutoTagNames: string[];
  hidden: boolean;
  lastReadDate: string;
  readingState: ReadingState;
  lastReadPage: number;
  readDirection: ReadDirection;
};

export type BookAutoTag = {
  type: string;
  name: string;
};

export type ReadDirection = "toLeft" | "toRight";

/**
 * Content of book like pdf.
 * Content data is not in this object.
 *
 * - Loaded from `LocalBookRepository`.
 * - Saved to `LocalBookRepository`.
 */
export type BookContentProps = {
  id: BookId;
  loadedDate: DateTime;
  lastFileModifiedDate: DateTime;
  type: BookType;
  fileSizeByte: number;
};

/**
 * Thumbnail of book like jpeg.
 * Thumbnail data is not in this object.
 *
 * - Loaded from `LocalBookRepository`.
 * - Saved to `LocalBookRepository`.
 */
export type BookThumbnailProps = {
  id: BookId;
  loadedDate: DateTime;
  lastFileModifiedDate: DateTime;
  fileSizeByte: number;
};

/**
 * Scan target directory for `BookSource`.
 */
export type ScanTargetDirectory<DirId extends DirectoryId = DirectoryId> = {
  displayPath: string;
  directoryId: DirId;
};
