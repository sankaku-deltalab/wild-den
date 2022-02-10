import { Result } from "../../../results";
import {
  BookSource,
  OnlineSourceError,
  SourceId,
  SourceIdStr,
} from "../../../core";

/**
 * Deal book sources of one cloud storage.
 */
export interface BookSourceFactory {
  getAllAvailableBookSources(): Promise<Record<SourceIdStr, BookSource>>;
  getBookSource(
    sourceId: SourceId
  ): Promise<Result<BookSource, OnlineSourceError>>;
}
