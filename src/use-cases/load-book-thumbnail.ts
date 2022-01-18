import { Result, Ok, Err } from "ts-results";
import {
  BookId,
  BookFileThumbnail,
  BookSource,
  BookCacheRepository,
} from "../core";

export class LoadBookThumbnail {
  async run(
    sources: BookSource[],
    cache: BookCacheRepository,
    id: BookId
  ): Promise<
    Result<BookFileThumbnail, "offline" | "not exists" | "source not found">
  > {
    const cachedThumbnail = cache.getThumbnail(id);
    if (cachedThumbnail.ok) return new Ok(cachedThumbnail.val);

    const source = sources.find((s) => s.getSourceId() == id.source);
    if (!source) return new Err("source not found");

    const loadedThumbnail = await source.loadThumbnail(id.file);
    if (loadedThumbnail.err) return loadedThumbnail;

    cache.setThumbnail(loadedThumbnail.val);
    return new Ok(loadedThumbnail.val);
  }
}
