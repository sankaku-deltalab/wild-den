import { Result, Ok, Err } from "ts-results";
import {
  BookCacheRepository,
  BookSource,
  BookProps,
  BookIdStr,
  BookId,
  BookFileThumbnail,
  BookFileBlob,
} from "../src";

export class BookCacheRepositoryMock implements BookCacheRepository {
  clean(): void {}

  resetSource(source: BookSource, allProps: BookProps[]): void {}

  getAllBookProps(): Record<BookIdStr, BookProps> {
    return {};
  }

  getBookProps(id: BookId): Result<BookProps, "not exists"> {
    return new Err("not exists");
  }

  setBookProps(props: BookProps): void {}

  getThumbnail(id: BookId): Result<BookFileThumbnail, "not exists"> {
    return new Err("not exists");
  }

  setThumbnail(thumbnail: BookFileThumbnail): void {}

  deleteThumbnail(id: BookId): void {}

  getBlob(id: BookId): Result<BookFileBlob, "not exists"> {
    return new Err("not exists");
  }

  setBlob(blob: BookFileBlob): void {}

  deleteBlob(id: BookId): void {}
}
