import {
  BookIdStr,
  BookProps,
  BookCacheRepository,
  BookSource,
  fileToBookProps,
  updateBooksProps,
} from "../core";
import { mapObj, DateUtil, Result, ok } from "../util";

export class ScanBooks {
  constructor(private readonly date: DateUtil) {}

  async run(
    source: BookSource,
    cache: BookCacheRepository
  ): Promise<Result<Record<BookIdStr, BookProps>, "offline">> {
    const now = this.date.now();
    const loadedFiles = await source.scanAllFiles();
    if (!loadedFiles.ok) return loadedFiles;
    const newBooks = mapObj(loadedFiles.val, (k, v) => fileToBookProps(now, v));
    const cachedBooks = cache.getAllBookProps();
    const books = updateBooksProps(newBooks, cachedBooks, source.getSourceId());
    cache.resetSource(source, Object.values(books));
    return ok(books);
  }
}
