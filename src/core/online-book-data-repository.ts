import { Result } from "../results";
import { CommonOnlineError } from "./common-error-types";
import { SourceId, BookProps, BookRecord, DirectoryId } from "./core-types";

/**
 * Interface of cloud storage like OneDrive, Dropbox and misc.
 * Download and store data shared in multiple device.
 *
 * Prerequisite: Multiple device not store props at the same time.
 */
export interface OnlineBookDataRepository<DirId extends DirectoryId = {}> {
  getSourceId(): SourceId;

  loadBookProps(): Promise<Result<BookRecord<BookProps>, CommonOnlineError>>;
  storeBookProps(
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>>;

  loadTargetDirectories(): Promise<Result<DirId[], CommonOnlineError>>;
  storeTargetDirectories(
    directories: DirId[]
  ): Promise<Result<void, CommonOnlineError>>;
}
