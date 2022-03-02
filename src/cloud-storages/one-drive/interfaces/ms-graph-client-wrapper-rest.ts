import { Result } from "../../../results";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem, MsGraphClientType } from "../types";

export type DriveItemId =
  | MyRootDriveItemId
  | SharedRootDriveItemId
  | AppRootDriveItemId
  | DriveItemIdById
  | MyDriveItemIdByPath
  | AppItemByPath;

export type EditableDriveItemId =
  | DriveItemIdById
  | MyDriveItemIdByPath
  | AppItemByPath;

export type MyRootDriveItemId = { type: "root" };
export type SharedRootDriveItemId = { type: "sharedRoot" };
export type AppRootDriveItemId = { type: "appRoot" };
export type DriveItemIdById = {
  type: "itemById";
  driveId: string;
  itemId: string;
};
export type MyDriveItemIdByPath = {
  type: "myItemByPath";
  parentPath: string[];
  itemName: string;
};
export type AppItemByPath = {
  type: "appItemByPath";
  parentPath: string[];
  itemName: string;
};

export interface MsGraphClientWrapperRest {
  getItem(
    itemId: EditableDriveItemId
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  deleteItem(
    itemId: EditableDriveItemId
  ): Promise<Result<void, OneDriveItemError>>;

  postItem<T>(
    itemId: DriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  patchItem<T>(
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  putItem<T>(
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  getChildren(
    itemId: DriveItemId
  ): Promise<Result<DriveItem[], OneDriveItemError>>;
}
