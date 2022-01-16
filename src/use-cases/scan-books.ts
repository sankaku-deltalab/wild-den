import { Result, Ok, Err } from "ts-results";
import { BookIdStr, BookProps, BookCacheRepository, BookSource } from "../core";

export class ScanBooks {
  async run(
    source: BookSource,
    cache: BookCacheRepository
  ): Promise<Result<Record<BookIdStr, BookProps>, "offline">> {
    return new Err("offline");
  }
}
