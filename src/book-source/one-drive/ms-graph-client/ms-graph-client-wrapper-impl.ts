import { Result } from "../../../results";
import { CommonOnlineError, DataUri } from "../../../core";
import { LoadProgressCallback } from "../../../core/interfaces";
import type { DriveItem, MsGraphClientType, DriveItemAsFile } from "../types";
import {
  downloadItemAsDataUri,
  downloadThumbnailAsDataUri,
  getFolderChildren,
  getItem,
  getTopMyItems,
  getTopSharedItems,
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
}
