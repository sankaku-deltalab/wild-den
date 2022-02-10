import { Result } from "../../../results";
import { OnlineSourceError, SourceId, SourceIdStr } from "../../../core";
import { BookSource } from "../../../core/interfaces";

/**
 * Deal book sources of one cloud storage.
 */
export interface BookSourceFactory {
  getAllAvailableBookSources(): Promise<Record<SourceIdStr, BookSource>>;
  getBookSource(
    sourceId: SourceId
  ): Promise<Result<BookSource, OnlineSourceError>>;
}
