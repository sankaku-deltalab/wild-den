import {
  BookId,
  BookProps,
  BookFileBlob,
  BookSource,
  BookCacheRepository,
} from "../core";
import { DateUtil, Result, ok, err } from "../util";

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
    if (cachedBlob.ok) return ok(cachedBlob.val);

    const source = sources.find((s) => s.getSourceId() == id.source);
    if (!source) return err("source not found");

    const loadedBlob = await source.loadBlob(id.file);
    if (loadedBlob.err) return loadedBlob;

    cache.setBlob(loadedBlob.val);

    return ok(loadedBlob.val);
  }
}
