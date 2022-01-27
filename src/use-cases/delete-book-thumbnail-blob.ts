import { BookId, BookCacheRepository } from "../core";

export class DeleteBookBlobCache {
  run(cache: BookCacheRepository, id: BookId): void {
    cache.deleteBlob(id);
  }
}
