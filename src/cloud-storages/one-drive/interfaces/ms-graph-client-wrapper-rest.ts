import { Result } from "../../../results";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem } from "../types";

export type DriveItemId =
  | MyRootDriveItemId
  | SharedRootDriveItemId
  | DriveItemIdById
  | MyDriveItemIdByPath
  | AppItemByPath;

export type EditableDriveItemId =
  | DriveItemIdById
  | MyDriveItemIdByPath
  | AppItemByPath;

export type MyRootDriveItemId = { type: "root" };
export type SharedRootDriveItemId = { type: "shared" };
export type DriveItemIdById = {
  type: "itemById";
  driveId: string;
  itemId: string;
};
export type MyDriveItemIdByPath = {
  type: "itemByPath";
  parentPath: string[];
  itemName: string;
};
export type AppItemByPath = {
  type: "appItemByPath";
  parentPath: string[];
  itemName: string;
};

export interface MsGraphClientWrapperRest {
  accessItem(
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    itemId: EditableDriveItemId
  ): Promise<Result<DriveItem, OneDriveItemError>>;

  getChildren(
    itemId: DriveItemId
  ): Promise<Result<DriveItem[], OneDriveItemError>>;
}
