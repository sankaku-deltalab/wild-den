import { CommonOnlineError, OnlineItemError } from "../../../core";
import { Result } from "../../../results";
import { DriveItem } from "./types";

export interface MsGraphClientWrapper {
  getItem(
    driveId: string,
    itemId: string
  ): Promise<Result<DriveItem, OnlineItemError>>;

  downloadItemAsDataUri(
    driveId: string,
    itemId: string
  ): Promise<Result<string, OnlineItemError>>;

  downloadThumbnailAsDataUri(
    driveId: string,
    itemId: string
  ): Promise<Result<string, OnlineItemError>>;

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
  ): Promise<Result<DriveItem[], OnlineItemError>>;
}
