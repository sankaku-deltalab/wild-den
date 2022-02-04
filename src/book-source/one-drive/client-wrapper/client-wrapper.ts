import { Result } from "../../../util";
import { MsGraphClientType } from "../../../use-cases/one-drive/types";
import type { DriveItem } from "./client-util/types";
import {
  downloadItemAsDataUri,
  downloadThumbnailAsDataUri,
  getFolderChildren,
} from "./client-util";
import { getTopMyItems } from "./client-util/get-top-my-items";
import { getTopSharedItems } from "./client-util/get-top-shared-items";
import { scanFolderTree } from "./scan-folder-tree";

export class ClientWrapper {
  constructor(private readonly client: MsGraphClientType) {}

  async downloadItemAsDataUri(
    driveId: string,
    itemId: string
  ): Promise<Result<string, "offline" | "not exists">> {
    return await downloadItemAsDataUri(this.client, driveId, itemId);
  }

  async downloadThumbnailAsDataUri(
    driveId: string,
    itemId: string
  ): Promise<Result<string, "offline" | "not exists">> {
    return await downloadThumbnailAsDataUri(this.client, driveId, itemId);
  }

  async getTopMyItems(
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], "offline">> {
    return await getTopMyItems(this.client, folderNameFilter);
  }

  async getTopSharedItems(
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], "offline">> {
    return await getTopSharedItems(this.client, folderNameFilter);
  }

  async getFolderChildrenItems(
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], "offline" | "not exists">> {
    return await getFolderChildren(
      this.client,
      driveId,
      itemId,
      folderNameFilter
    );
  }

  async scanFolderItems(
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], "offline" | "not exists">> {
    return await scanFolderTree(this.client, driveId, itemId, folderNameFilter);
  }
}
