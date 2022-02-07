import { Result } from "../../../results";
import {
  CommonOnlineError,
  DataUri,
  LoadProgressCallback,
  OnlineItemError,
} from "../../../core";
import type {
  DriveItem,
  MsGraphClientWrapper,
  MsGraphClientType,
  DriveItemAsFile,
} from "../interface-adapter/types";
import {
  downloadItemAsDataUri,
  downloadThumbnailAsDataUri,
  getFolderChildren,
  getItem,
  getTopMyItems,
  getTopSharedItems,
} from "./ms-graph-client-wrapper-impl-functions";

export class MsGraphClientWrapperImpl implements MsGraphClientWrapper {
  constructor(private readonly client: MsGraphClientType) {}

  async getItem(
    driveId: string,
    itemId: string
  ): Promise<Result<DriveItem, OnlineItemError>> {
    return await getItem(this.client, driveId, itemId);
  }

  async downloadItemAsDataUri(
    driveId: string,
    itemId: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OnlineItemError>> {
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
  ): Promise<Result<[DriveItemAsFile, DataUri], OnlineItemError>> {
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
  ): Promise<Result<DriveItem[], OnlineItemError>> {
    return await getFolderChildren(
      this.client,
      driveId,
      itemId,
      folderNameFilter
    );
  }
}
