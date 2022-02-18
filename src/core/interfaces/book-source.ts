import { DateTime } from "../../util";
import { Result } from "../../results";
import { CommonOnlineError, OnlineBookError } from "../common-error";
import {
  SourceId,
  BookId,
  BookType,
  DataUri,
  BookRecord,
  DirectoryId,
  ScanTargetDirectory,
} from "../core-types";
import { OnlineSourceError } from "..";

/**
 * Interface of cloud storage like OneDrive, Dropbox and misc.
 * Download file and file props.
 */
export interface BookSource {
  /**
   * Get all available sources.
   */
  getAllAvailableBookSourceIds(): Promise<SourceId[]>;

  /**
   * Scan all target files and deal file props.
   * Contents and thumbnails are not dealt.
   *
   * @param source Target source id.
   */
  scanAllFiles(
    source: SourceId
  ): Promise<Result<BookRecord<FileProps>, OnlineSourceError>>;

  /**
   * Load file content.
   *
   * @param bookId Target book id.
   * @param loadProgressCallback Emit download progress.
   */
  loadContent(
    bookId: BookId,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<FileContent, OnlineBookError>>;

  /**
   * Load file thumbnail.
   *
   * @param bookId Target book id.
   */
  loadThumbnail(
    bookId: BookId
  ): Promise<Result<FileThumbnail, OnlineBookError>>;

  /**
   * Load Top directories.
   */
  loadTopDirectories(
    source: SourceId
  ): Promise<Result<ScanTargetDirectory[], CommonOnlineError>>;

  /**
   * Load children directories.
   *
   * @param parentDirId Parent directory.
   */
  loadChildrenDirectories(
    source: SourceId,
    parentDirId: DirectoryId
  ): Promise<Result<ScanTargetDirectory[], OnlineBookError>>;

  getDirectoryDisplayPath(
    source: SourceId,
    dirId: DirectoryId
  ): Promise<Result<string, OnlineBookError>>;
}

/** File props from `BookSource`. */
export type FileProps = {
  id: BookId;
  type: BookType;
  title?: string;
  author?: string;
  fileName?: string;
  path?: string;
  givenTags: string[];
  lastModifiedDate: DateTime;
};

/** File content from `BookSource`. */
export type FileContent = {
  id: BookId;
  type: BookType;
  fileSizeByte: number;
  lastModifiedDate: DateTime;
  dataUri: DataUri;
};

/** File thumbnail from `BookSource`. */
export type FileThumbnail = {
  id: BookId;
  fileSizeByte: number;
  lastModifiedDate: DateTime;
  dataUri: DataUri;
};

export type LoadProgressCallback = (
  elapsedByte: number,
  totalByte: number
) => unknown;
