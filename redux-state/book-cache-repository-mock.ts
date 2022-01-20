import { Result, Ok, Err } from "ts-results";
import {
  BookCacheRepository,
  BookSource,
  BookProps,
  BookIdStr,
  BookId,
  BookFileThumbnail,
  BookFileBlob,
  bookIdToStr,
  filterObj,
} from "../src";

export class BookCacheRepositoryMock implements BookCacheRepository {
  private bookProps: Record<BookIdStr, BookProps> = {};
  private bookBlobs: Record<BookIdStr, BookFileBlob> = {};
  private bookThumbnails: Record<BookIdStr, BookFileThumbnail> = {};

  clean(): void {
    this.bookProps = {};
    this.bookBlobs = {};
    this.bookThumbnails = {};
  }

  resetSource(source: BookSource, allProps: BookProps[]): void {
    const allPropsAsObj = Object.fromEntries(
      allProps.map((p) => [bookIdToStr(p.id), p])
    );
    const oldProps = filterObj(
      this.bookProps,
      (_, p) => p.id.source !== source.getSourceId()
    );
    this.bookProps = {
      ...oldProps,
      ...allPropsAsObj,
    };
  }

  getAllBookProps(): Record<BookIdStr, BookProps> {
    return this.bookProps;
  }

  getBookProps(id: BookId): Result<BookProps, "not exists"> {
    const idStr = bookIdToStr(id);
    if (idStr in this.bookProps) {
      return new Ok(this.bookProps[idStr]);
    }
    return new Err("not exists");
  }

  setBookProps(props: BookProps): void {
    const idStr = bookIdToStr(props.id);
    this.bookProps[idStr] = props;
  }

  getThumbnail(id: BookId): Result<BookFileThumbnail, "not exists"> {
    const idStr = bookIdToStr(id);
    if (idStr in this.bookThumbnails) {
      return new Ok(this.bookThumbnails[idStr]);
    }
    return new Err("not exists");
  }

  setThumbnail(thumbnail: BookFileThumbnail): void {
    const idStr = bookIdToStr(thumbnail.id);
    this.bookThumbnails[idStr] = thumbnail;
  }

  deleteThumbnail(id: BookId): void {}

  getBlob(id: BookId): Result<BookFileBlob, "not exists"> {
    const idStr = bookIdToStr(id);
    if (idStr in this.bookBlobs) {
      return new Ok(this.bookBlobs[idStr]);
    }
    return new Err("not exists");
  }

  setBlob(blob: BookFileBlob): void {
    const idStr = bookIdToStr(blob.id);
    this.bookBlobs[idStr] = blob;
  }

  deleteBlob(id: BookId): void {}
}
