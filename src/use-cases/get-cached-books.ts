import { BookIdStr, BookProps, BookCacheRepository } from "../core";

export class GetCachedBooks {
  run(cache: BookCacheRepository): Record<BookIdStr, BookProps> {
    return cache.getAllBookProps();
  }
}
