import { Result, Ok, Err } from "ts-results";
import {
  BookId,
  BookProps,
  BookFileBlob,
  BookSource,
  BookCacheRepository,
} from "../core";
import { DateUtil } from "../util";

export class LoadBookBlob {
  constructor(private readonly date: DateUtil) {}

  async run(
    sources: BookSource[],
    cache: BookCacheRepository,
    id: BookId
  ): Promise<
    Result<BookFileBlob, "offline" | "not exists" | "source not found">
  > {
    const cachedBlob = cache.getBlob(id);
    if (cachedBlob.ok) return new Ok(cachedBlob.val);

    const source = sources.find((s) => s.getSourceId() == id.source);
    if (!source) return new Err("source not found");

    const loadedBlob = await source.loadBlob(id.file);
    if (loadedBlob.err) return loadedBlob;

    cache.setBlob(loadedBlob.val);

    return new Ok(loadedBlob.val);
  }
}
