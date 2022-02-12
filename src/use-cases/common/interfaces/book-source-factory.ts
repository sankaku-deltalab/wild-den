import { Result } from "../../../results";
import { OnlineSourceError, SourceId } from "../../../core";
import { BookSource } from "../../../core/interfaces";

/**
 * Deal book sources of one cloud storage.
 */
export interface BookSourceFactory {
  getAllAvailableBookSourceIds(): Promise<SourceId[]>;
  getBookSource(
    sourceId: SourceId
  ): Promise<Result<BookSource, OnlineSourceError>>;
}
