import {
  LocalRepositoryBookError,
  LocalRepositoryConnectionError,
} from "../common-error";
import { Result } from "../../results";
import {
  BookId,
  BookContentProps,
  BookThumbnailProps,
  SourceId,
  BookProps,
  DataUri,
  BookRecord,
} from "../core-types";

/**
 * Contain caches of books data and binary.
 * This class would be implemented with system like indexed-db.
 */
export interface LocalBookRepository {
  /**
   * Delete all cache.
   */
  clean(): Promise<Result<void, LocalRepositoryConnectionError>>;

  /**
   * Reset book props of single source.
   *
   * @param sourceId Resetting source id.
   * @param allProps New all props.
   */
  resetBookPropsOfSource(
    sourceId: SourceId,
    allProps: BookProps[]
  ): Promise<Result<void, LocalRepositoryConnectionError>>;

  loadAllBookProps(): Promise<
    Result<BookRecord<BookProps>, LocalRepositoryConnectionError>
  >;
  loadBookProps(
    id: BookId
  ): Promise<Result<BookProps, LocalRepositoryBookError>>;
  storeMultipleBookProps(
    props: BookRecord<BookProps>
  ): Promise<Result<void, LocalRepositoryConnectionError>>;

  loadAllContentProps(): Promise<
    Result<BookRecord<BookContentProps>, LocalRepositoryConnectionError>
  >;
  loadContentProps(
    id: BookId
  ): Promise<Result<BookContentProps, LocalRepositoryBookError>>;
  loadContentData(
    id: BookId
  ): Promise<Result<DataUri, LocalRepositoryBookError>>;
  storeContent(
    props: BookContentProps,
    data: DataUri
  ): Promise<Result<void, LocalRepositoryConnectionError>>;
  deleteContent(
    id: BookId
  ): Promise<Result<void, LocalRepositoryConnectionError>>;

  loadAllThumbnailProps(): Promise<
    Result<BookRecord<BookThumbnailProps>, LocalRepositoryConnectionError>
  >;
  loadThumbnailProps(
    id: BookId
  ): Promise<Result<BookThumbnailProps, LocalRepositoryBookError>>;
  loadThumbnailData(
    id: BookId
  ): Promise<Result<DataUri, LocalRepositoryBookError>>;
  storeThumbnail(
    props: BookThumbnailProps,
    data: DataUri
  ): Promise<Result<void, LocalRepositoryConnectionError>>;
  deleteThumbnail(
    id: BookId
  ): Promise<Result<void, LocalRepositoryConnectionError>>;
}
