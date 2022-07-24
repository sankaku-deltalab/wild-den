import { inject, injectable, singleton } from "tsyringe";
import {
  BookId,
  BookRecord,
  CommonOnlineError,
  DirectoryId,
  OnlineBookError,
  OnlineSourceError,
  ScanTargetDirectory,
  SourceId,
} from "../core";
import type {
  BookSource,
  FileContent,
  FileProps,
  FileThumbnail,
  LoadProgressCallback,
} from "../core/interfaces";
import { injectTokens as it } from "../inject-tokens";
import { Result } from "../results";
import type { OneDriveBookSource } from "./interfaces";

@singleton()
@injectable()
export class BookSourceImpl implements BookSource {
  constructor(
    @inject(it.OneDriveBookSource)
    private readonly oneDriveBookSource: OneDriveBookSource
  ) {}

  /**
   * Get all available sources.
   */
  async getAllAvailableBookSourceIds(): Promise<SourceId[]> {
    return await this.oneDriveBookSource.getAllAvailableBookSourceIds();
  }

  /**
   * Scan all target files and deal file props.
   * Contents and thumbnails are not dealt.
   *
   * @param source Target source id.
   */
  scanAllFiles(
    source: SourceId
  ): Promise<Result<BookRecord<FileProps>, OnlineSourceError>> {
    return this.getSource(source).scanAllFiles(source);
  }

  /**
   * Load file content.
   *
   * @param bookId Target book id.
   * @param loadProgressCallback Emit download progress.
   */
  loadContent(
    bookId: BookId,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<FileContent, OnlineBookError>> {
    return this.getSource(bookId.source).loadContent(
      bookId,
      loadProgressCallback
    );
  }

  /**
   * Load file thumbnail.
   *
   * @param bookId Target book id.
   */
  loadThumbnail(
    bookId: BookId
  ): Promise<Result<FileThumbnail, OnlineBookError>> {
    return this.getSource(bookId.source).loadThumbnail(bookId);
  }

  /**
   * Load Top directories.
   */
  loadTopDirectories(
    source: SourceId
  ): Promise<Result<ScanTargetDirectory[], CommonOnlineError>> {
    return this.getSource(source).loadTopDirectories(source);
  }

  /**
   * Load children directories.
   *
   * @param parentDirId Parent directory.
   */
  loadChildrenDirectories(
    source: SourceId,
    parentDirId: DirectoryId
  ): Promise<Result<ScanTargetDirectory[], OnlineBookError>> {
    return this.getSource(source).loadChildrenDirectories(source, parentDirId);
  }

  getDirectoryDisplayPath(
    source: SourceId,
    dirId: DirectoryId
  ): Promise<Result<string, OnlineBookError>> {
    return this.getSource(source).getDirectoryDisplayPath(source, dirId);
  }

  private getSource(sourceId: SourceId): BookSource {
    if (sourceId.sourceType === "OneDrive") return this.oneDriveBookSource;
    throw new Error("unknown source");
  }
}
