import { Result, Ok, Err } from "ts-results";
import { BookIdStr, BookCacheRepository } from "../core";

export class DeleteBookThumbnailCache {
  run(cache: BookCacheRepository, id: BookIdStr): void {}
}
