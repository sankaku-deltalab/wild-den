import { Result, ok, err } from "../results";
import {
  BookProps,
  BookId,
  bookIdToStr,
  BookContentProps,
  LocalRepositoryConnectionError,
  SourceId,
  BookThumbnailProps,
  BookRecord,
  bookNotExistsInLocalRepositoryError,
  LocalRepositoryBookError,
  sourceIdToStr,
  DataUri,
} from "../core";
import { LocalBookRepository } from "../core/interfaces";

export class LocalBookRepositoryMock implements LocalBookRepository {
  private bookProps: BookRecord<BookProps> = {};
  private bookContentProps: BookRecord<BookContentProps> = {};
  private bookContentData: BookRecord<DataUri> = {};
  private bookThumbnailProps: BookRecord<BookThumbnailProps> = {};
  private bookThumbnailData: BookRecord<DataUri> = {};

  async clean(): Promise<Result<void, LocalRepositoryConnectionError>> {
    this.bookProps = {};
    this.bookContentProps = {};
    this.bookThumbnailProps = {};
    return ok(undefined);
  }

  /**
   * Reset book props of single source.
   *
   * @param sourceId Resetting source id.
   * @param allProps New all props.
   */
  async resetBookPropsOfSource(
    sourceId: SourceId,
    allProps: BookProps[]
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const sidStr = sourceIdToStr(sourceId);
    const props = allProps.filter((p) => sourceIdToStr(p.id.source) === sidStr);
    const otherProps = Object.values(this.bookProps).filter(
      (p) => sourceIdToStr(p.id.source) === sidStr
    );
    const newAllProps = props.concat(otherProps);
    this.bookProps = Object.fromEntries(
      newAllProps.map((p) => [bookIdToStr(p.id), p])
    );
    return ok(undefined);
  }

  async loadAllBookProps(): Promise<
    Result<BookRecord<BookProps>, LocalRepositoryConnectionError>
  > {
    return ok(this.bookProps);
  }

  async loadBookProps(
    id: BookId
  ): Promise<Result<BookProps, LocalRepositoryBookError>> {
    const idStr = bookIdToStr(id);
    if (!(idStr in this.bookProps))
      return err(bookNotExistsInLocalRepositoryError(id));

    return ok(this.bookProps[idStr]);
  }

  async storeAllBookProps(
    props: BookRecord<BookProps>
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    this.bookProps = props;
    return ok(undefined);
  }

  async loadAllContentProps(): Promise<
    Result<BookRecord<BookContentProps>, LocalRepositoryConnectionError>
  > {
    return ok(this.bookContentProps);
  }

  async loadContentProps(
    id: BookId
  ): Promise<Result<BookContentProps, LocalRepositoryBookError>> {
    const idStr = bookIdToStr(id);
    if (!(idStr in this.bookContentProps))
      return err(bookNotExistsInLocalRepositoryError(id));
    return ok(this.bookContentProps[idStr]);
  }

  async loadContentData(
    id: BookId
  ): Promise<Result<DataUri, LocalRepositoryBookError>> {
    const idStr = bookIdToStr(id);
    if (!(idStr in this.bookContentData))
      return err(bookNotExistsInLocalRepositoryError(id));
    return ok(this.bookContentData[idStr]);
  }

  async storeContent(
    props: BookContentProps,
    data: DataUri
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const id = props.id;
    const idStr = bookIdToStr(id);
    this.bookContentProps[idStr] = props;
    this.bookContentData[idStr] = data;
    return ok(undefined);
  }

  async deleteContent(
    id: BookId
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const idStr = bookIdToStr(id);
    delete this.bookContentProps[idStr];
    delete this.bookContentData[idStr];
    return ok(undefined);
  }

  async loadAllThumbnailProps(): Promise<
    Result<BookRecord<BookThumbnailProps>, LocalRepositoryConnectionError>
  > {
    return ok(this.bookThumbnailProps);
  }

  async loadThumbnailProps(
    id: BookId
  ): Promise<Result<BookThumbnailProps, LocalRepositoryBookError>> {
    const idStr = bookIdToStr(id);
    if (!(idStr in this.bookThumbnailProps))
      return err(bookNotExistsInLocalRepositoryError(id));
    return ok(this.bookThumbnailProps[idStr]);
  }

  async loadThumbnailData(
    id: BookId
  ): Promise<Result<DataUri, LocalRepositoryBookError>> {
    const idStr = bookIdToStr(id);
    if (!(idStr in this.bookThumbnailData))
      return err(bookNotExistsInLocalRepositoryError(id));
    return ok(this.bookThumbnailData[idStr]);
  }

  async storeThumbnail(
    props: BookThumbnailProps,
    data: DataUri
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const id = props.id;
    const idStr = bookIdToStr(id);
    this.bookThumbnailProps[idStr] = props;
    this.bookThumbnailData[idStr] = data;
    return ok(undefined);
  }

  async deleteThumbnail(
    id: BookId
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const idStr = bookIdToStr(id);
    delete this.bookThumbnailProps[idStr];
    delete this.bookThumbnailData[idStr];
    return ok(undefined);
  }
}
