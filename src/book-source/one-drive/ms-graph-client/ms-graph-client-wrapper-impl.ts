import { Result } from "../../../results";
import { CommonOnlineError, DataUri } from "../../../core";
import { LoadProgressCallback } from "../../../core/interfaces";
import type {
  DriveItem,
  MsGraphClientType,
  DriveItemAsFile,
  DriveItemAsFolder,
} from "../types";
import {
  downloadAppFolderItemAsDataUri,
  downloadItemAsDataUri,
  downloadThumbnailAsDataUri,
  getFolderChildren,
  getFolderChildrenFromAppFolder,
  getItem,
  getTopMyItems,
  getTopSharedItems,
  postFolderToAppRoot,
  putSmallTextToAppRoot,
  deleteItemInAppFolder,
} from "./ms-graph-client-wrapper-impl-functions";
import { OneDriveItemError } from "../one-drive-error";
import { MsGraphClientWrapper } from "../interfaces";

export class MsGraphClientWrapperImpl implements MsGraphClientWrapper {
  constructor(private readonly client: MsGraphClientType) {}

  async getItem(
    driveId: string,
    itemId: string
  ): Promise<Result<DriveItem, OneDriveItemError>> {
    return await getItem(this.client, driveId, itemId);
  }

  async downloadItemAsDataUri(
    driveId: string,
    itemId: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>> {
    return await downloadItemAsDataUri(
      this.client,
      driveId,
      itemId,
      loadProgressCallback
    );
  }

  async downloadThumbnailAsDataUri(
    driveId: string,
    itemId: string
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>> {
    return await downloadThumbnailAsDataUri(this.client, driveId, itemId);
  }

  async getTopMyItems(
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], CommonOnlineError>> {
    return await getTopMyItems(this.client, folderNameFilter);
  }

  async getTopSharedItems(
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], CommonOnlineError>> {
    return await getTopSharedItems(this.client, folderNameFilter);
  }

  async getFolderChildrenItems(
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>> {
    return await getFolderChildren(
      this.client,
      driveId,
      itemId,
      folderNameFilter
    );
  }

  async postFolderToAppRoot(
    folderName: string
  ): Promise<Result<DriveItemAsFolder, OneDriveItemError>> {
    return await postFolderToAppRoot(this.client, folderName);
  }

  async putSmallTextToAppRoot(
    folders: string[],
    fileName: string,
    content: string
  ): Promise<Result<DriveItemAsFile, OneDriveItemError>> {
    return await putSmallTextToAppRoot(this.client, folders, fileName, content);
  }

  async getFolderChildrenFromAppFolder(
    parentPath: string[],
    folderName: string
  ): Promise<Result<DriveItem[], OneDriveItemError>> {
    return await getFolderChildrenFromAppFolder(
      this.client,
      parentPath,
      folderName
    );
  }

  async downloadAppFolderItemAsDataUri(
    folders: string[],
    fileName: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>> {
    return await downloadAppFolderItemAsDataUri(
      this.client,
      folders,
      fileName,
      loadProgressCallback
    );
  }

  async deleteItemInAppFolder(
    parentPath: string[],
    itemName: string
  ): Promise<Result<void, OneDriveItemError>> {
    return await deleteItemInAppFolder(this.client, parentPath, itemName);
  }
}
