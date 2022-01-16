import { Result, Ok, Err } from "ts-results";
import {
  BookIdStr,
  BookFileBlob,
  BookSource,
  BookCacheRepository,
} from "../core";

export class LoadBookBlob {
  async run(
    sources: BookSource[],
    cache: BookCacheRepository,
    id: BookIdStr
  ): Promise<Result<BookFileBlob, "offline">> {
    return new Err("offline");
  }
}
