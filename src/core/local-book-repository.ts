import { Result } from "../results";
import {
  BookId,
  BookContentProps,
  BookThumbnailProps,
  SourceId,
  BookProps,
  DataUri,
  BookRecord,
} from "./core-types";

export type ItemLoadError = "not exists";

/**
 * Contain caches of books data and binary.
 * This class would be implemented with system like indexed-db.
 */
export interface LocalBookRepository {
  /**
   * Delete all cache.
   */
  clean(): Promise<Result<never, never>>;

  /**
   * Reset book props of single source.
   *
   * @param sourceId Resetting source id.
   * @param allProps New all props.
   */
  resetBookPropsOfSource(
    sourceId: SourceId,
    allProps: BookProps[]
  ): Promise<Result<never, never>>;

  loadAllBookProps(): Promise<Result<BookRecord<BookProps>, never>>;
  loadBookProps(id: BookId): Promise<Result<BookProps, ItemLoadError>>;
  storeBookProps(props: BookProps): Promise<Result<never, never>>;

  loadAllContentProps(): Promise<Result<BookRecord<BookContentProps>, never>>;
  loadContentProps(
    id: BookId
  ): Promise<Result<BookContentProps, ItemLoadError>>;
  loadContentData(id: BookId): Promise<Result<DataUri, ItemLoadError>>;
  storeContent(
    props: BookContentProps,
    data: DataUri
  ): Promise<Result<never, never>>;
  deleteContent(id: BookId): void;

  loadAllThumbnailProps(): Promise<
    Result<BookRecord<BookThumbnailProps>, never>
  >;
  loadThumbnailProps(
    id: BookId
  ): Promise<Result<BookThumbnailProps, ItemLoadError>>;
  loadThumbnailData(id: BookId): Promise<Result<DataUri, ItemLoadError>>;
  storeThumbnail(
    props: BookThumbnailProps,
    data: DataUri
  ): Promise<Result<never, never>>;
  deleteThumbnail(id: BookId): void;
}
