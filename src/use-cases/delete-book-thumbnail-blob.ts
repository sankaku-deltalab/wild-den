import { Result, Ok, Err } from "ts-results";
import { BookIdStr, BookCacheRepository } from "../core";

export class DeleteBookThumbnailBlob {
  run(cache: BookCacheRepository, id: BookIdStr): void {}
}
