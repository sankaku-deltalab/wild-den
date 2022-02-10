import {
  CommonOnlineError,
  DataUri,
  LoadProgressCallback,
} from "../../../core";
import { Result } from "../../../results";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem, DriveItemAsFile } from "../types";

export interface MsGraphClientWrapper {
  getItem(
    driveId: string,
    itemId: string
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  downloadItemAsDataUri(
    driveId: string,
    itemId: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>>;

  downloadThumbnailAsDataUri(
    driveId: string,
    itemId: string
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>>;

  getTopMyItems(
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], CommonOnlineError>>;

  getTopSharedItems(
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], CommonOnlineError>>;

  getFolderChildrenItems(
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>>;
}
