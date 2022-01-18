import { Result, Ok, Err } from "ts-results";
import { BookId, BookCacheRepository } from "../core";

export class DeleteBookBlobCache {
  run(cache: BookCacheRepository, id: BookId): void {
    cache.deleteBlob(id);
  }
}
