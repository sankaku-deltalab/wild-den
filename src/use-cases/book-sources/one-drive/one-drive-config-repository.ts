import { OneDriveDirectoryId } from ".";
import {
  CommonOnlineError,
  LocalRepositoryConnectionError,
  ScanTargetDirectory,
  SourceId,
} from "../../../core";
import { Result } from "../../../results";
import { DateTime } from "../../../util";

export interface OneDriveConfigRepository {
  storeConfig(
    sourceId: SourceId,
    config: OneDriveConfig
  ): Promise<Result<void, CommonOnlineError | LocalRepositoryConnectionError>>;

  loadConfig(
    sourceId: SourceId
  ): Promise<
    Result<OneDriveConfig, CommonOnlineError | LocalRepositoryConnectionError>
  >;
}

export interface OneDriveConfigOnlineRepository {
  storeConfig(
    sourceId: SourceId,
    config: OneDriveConfig
  ): Promise<Result<void, CommonOnlineError>>;

  loadConfig(
    sourceId: SourceId
  ): Promise<Result<OneDriveConfig, CommonOnlineError>>;
}

export interface OneDriveConfigLocalRepository {
  storeConfig(
    sourceId: SourceId,
    config: OneDriveConfig
  ): Promise<Result<void, LocalRepositoryConnectionError>>;

  loadConfig(
    sourceId: SourceId
  ): Promise<Result<OneDriveConfig, LocalRepositoryConnectionError>>;
}

export type OneDriveConfig = {
  lastModifiedDate: DateTime;
  targetRootDirectories: ScanTargetDirectory<OneDriveDirectoryId>[];
  ignoreFolderNames: string[];
};
