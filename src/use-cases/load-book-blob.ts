import { Result, Ok, Err } from "ts-results";
import { BookId, BookFileBlob, BookSource, BookCacheRepository } from "../core";

export class LoadBookBlob {
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
