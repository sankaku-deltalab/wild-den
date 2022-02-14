import { DateTime } from "../../util";
import { Result } from "../../results";
import { CommonOnlineError, OnlineBookError } from "../common-error";
import {
  SourceId,
  BookId,
  BookType,
  FileId,
  DataUri,
  BookRecord,
  DirectoryId,
  ScanTargetDirectory,
  BookContentProps,
  BookThumbnailProps,
} from "../core-types";

/**
 * Interface of cloud storage like OneDrive, Dropbox and misc.
 * Download file and file props.
 */
export interface BookSource<DirId extends DirectoryId = {}> {
  getSourceId(): SourceId;

  /**
   * Scan all target files and deal file props.
   * Contents and thumbnails are not dealt.
   */
  scanAllFiles(): Promise<Result<BookRecord<FileProps>, CommonOnlineError>>;

  /**
   * Load file content.
   *
   * @param fileId Target file id.
   * @param loadProgressCallback Emit download progress.
   */
  loadContent(
    fileId: FileId,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<FileContent, OnlineBookError>>;

  /**
   * Load file thumbnail.
   *
   * @param fileId Target file id.
   */
  loadThumbnail(
    fileId: FileId
  ): Promise<Result<FileThumbnail, OnlineBookError>>;

  /**
   * Load Top directories.
   */
  loadTopDirectories(): Promise<
    Result<ScanTargetDirectory<DirId>[], CommonOnlineError>
  >;

  /**
   * Load children directories.
   *
   * @param parentDirId Parent directory.
   */
  loadChildrenDirectories(
    parentDirId: DirId
  ): Promise<Result<ScanTargetDirectory<DirId>[], OnlineBookError>>;

  getDirectoryDisplayPath(
    dirId: DirId
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