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
    client: MsGraphClientType,
    itemId: EditableDriveItemId
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  deleteItem(
    client: MsGraphClientType,
    itemId: EditableDriveItemId
  ): Promise<Result<void, OneDriveItemError>>;

  postItem<T>(
    client: MsGraphClientType,
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  patchItem<T>(
    client: MsGraphClientType,
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  putItem<T>(
    client: MsGraphClientType,
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  getChildren(
    client: MsGraphClientType,
    itemId: DriveItemId
  ): Promise<Result<DriveItem[], OneDriveItemError>>;
}
