import { CommonOnlineError, DataUri } from "../../../core";
import { LoadProgressCallback } from "../../../core/interfaces";
import { Result } from "../../../results";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem, DriveItemAsFile, DriveItemAsFolder } from "../types";

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

  postFolderToAppRoot(
    folderName: string
  ): Promise<Result<DriveItemAsFolder, OneDriveItemError>>;

  putSmallTextToAppRoot(
    folders: string[],
    fileName: string,
    content: string
  ): Promise<Result<DriveItemAsFile, OneDriveItemError>>;

  getFolderChildrenFromAppFolder(
    parentPath: string[],
    folderName: string
  ): Promise<Result<DriveItem[], OneDriveItemError>>;

  downloadAppFolderItemAsDataUri(
    folders: string[],
    fileName: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>>;

  deleteItemInAppFolder(
    parentPath: string[],
    itemName: string
  ): Promise<Result<void, OneDriveItemError>>;
}
