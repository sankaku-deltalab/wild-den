import { Result, Ok, Err } from "ts-results";
import { BookId, BookCacheRepository } from "../core";

export class DeleteBookThumbnailCache {
  run(cache: BookCacheRepository, id: BookId): void {
    cache.deleteThumbnail(id);
  }
}
