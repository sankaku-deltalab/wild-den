import { Result } from "../../results";
import { DateTime } from "../../util";
import { CommonOnlineError } from "../common-error";
import { SourceId, DirectoryId, ScanTargetDirectory } from "../core-types";

export type BookSourceConfig<DirId extends DirectoryId> = {
  lastModifiedDate: DateTime;
  targetRootDirectories: ScanTargetDirectory<DirId>[];
  ignoreFolderNames: string[];
};

/**
 * Interface of cloud storage like OneDrive, Dropbox and misc.
 * Download and store config shared in multiple device.
 *
 * Prerequisite: Multiple device not store props at the same time.
 */
export interface OnlineBookSourceConfigRepository<DirId extends DirectoryId> {
  getSourceId(): SourceId;

  loadConfig(): Promise<Result<BookSourceConfig<DirId>, CommonOnlineError>>;
  storeConfig(
    config: BookSourceConfig<DirId>
  ): Promise<Result<void, CommonOnlineError>>;
}
