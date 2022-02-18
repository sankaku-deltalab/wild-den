import { OnlineSourceError } from "..";
import { Result } from "../../results";
import { DateTime } from "../../util";
import { SourceId, DirectoryId, ScanTargetDirectory } from "../core-types";

export type BookSourceConfig<DirId extends DirectoryId = DirectoryId> = {
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
export interface OnlineConfigRepository {
  loadConfig(
    source: SourceId
  ): Promise<Result<BookSourceConfig, OnlineSourceError>>;

  storeConfig(
    source: SourceId,
    config: BookSourceConfig
  ): Promise<Result<void, OnlineSourceError>>;
}
