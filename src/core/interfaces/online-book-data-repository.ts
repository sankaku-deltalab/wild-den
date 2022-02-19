import { BookId, OnlineBookError } from "..";
import { Result } from "../../results";
import { CommonOnlineError } from "../common-error";
import { SourceId, BookProps, BookRecord } from "../core-types";

/**
 * Interface of cloud storage like OneDrive, Dropbox and misc.
 * Download and store data shared in multiple device.
 *
 * Prerequisite: Multiple device not store props at the same time.
 */
export interface OnlineBookDataRepository {
  loadAllStoredBookProps(
    source: SourceId
  ): Promise<Result<BookRecord<BookProps>, CommonOnlineError>>;

  loadStoredBookProps(
    book: BookId
  ): Promise<Result<BookProps, OnlineBookError>>;

  resetBookPropsOfSource(
    source: SourceId,
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>>;

  storeBookProps(book: BookId): Promise<Result<void, OnlineBookError>>;
}
