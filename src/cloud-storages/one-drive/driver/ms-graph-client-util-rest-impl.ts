import { injectable, singleton } from "tsyringe";
import { Result, ok, isOk } from "../../../results";
import { OneDriveDirectoryId } from "../../../use-cases/book-sources/one-drive";
import {
  DriveItemTree,
  MsGraphClientUtilRest,
} from "../interfaces/ms-graph-client-util-rest";
import { MsGraphClientWrapperRest } from "../interfaces/ms-graph-client-wrapper-rest";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem, MsGraphClientType } from "../types";
import {
  getDriveId,
  getItemId,
  isFile,
  isFolder,
  isSpecialFolder,
  rootDirectoryName,
} from "../util";

@singleton()
@injectable()
export class MsGraphClientUtilRestImpl implements MsGraphClientUtilRest {
  scanItemsUnderItem(
    client: MsGraphClientWrapperRest,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItemTree, OneDriveItemError>> {
    if (directoryId.type === "topMyItems") {
      return scanItemsUnderMyRoot(client, folderNameFilter);
    }
    if (directoryId.type === "topShared") {
      return scanItemsUnderSharedRoot(client, folderNameFilter);
    }
    return scanItemsUnderItemById(
      client,
      directoryId.driveId,
      directoryId.itemId,
      folderNameFilter
    );
  }

  async getItemChildren(
    client: MsGraphClientWrapperRest,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>> {
    const getItemChildrenRaw = (
      client: MsGraphClientWrapperRest,
      directoryId: OneDriveDirectoryId
    ): Promise<Result<DriveItem[], OneDriveItemError>> => {
      if (directoryId.type === "topMyItems") {
        return client.getChildren({ type: "appRoot" });
      }
      if (directoryId.type === "topShared") {
        return client.getChildren({ type: "sharedRoot" });
      }
      return client.getChildren({
        type: "itemById",
        driveId: directoryId.driveId,
        itemId: directoryId.itemId,
      });
    };
    const r = await getItemChildrenRaw(client, directoryId);
    if (r.err) return r;
    return ok(filterItems(r.val, folderNameFilter));
  }
}

const filterItems = (
  driveItems: DriveItem[],
  folderNameFilter: (name: string) => boolean
): DriveItem[] => {
  const valuesNotSpecial = driveItems.filter((v) => !isSpecialFolder(v));
  const notFileAndNotFolderItem = valuesNotSpecial.filter(
    (v) => !isFile(v) && !isFolder(v)
  );
  const fileItems = valuesNotSpecial.filter((v) => isFile(v));
  const folderItems = valuesNotSpecial.filter(
    (v) => isFolder(v) && folderNameFilter(v.name)
  );
  return [...notFileAndNotFolderItem, ...fileItems, ...folderItems];
};

const scanItemsUnderMyRoot = async (
  client: MsGraphClientWrapperRest,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  const children = await client.getChildren({ type: "root" });
  if (children.err) return children;

  const r = await scanItemsUnderItems(client, children.val, folderNameFilter);
  if (r.err) return r;

  return ok({
    name: rootDirectoryName,
    children: r.val,
  });
};

const scanItemsUnderSharedRoot = async (
  client: MsGraphClientWrapperRest,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  const children = await client.getChildren({ type: "sharedRoot" });
  if (children.err) return children;

  const r = await scanItemsUnderItems(client, children.val, folderNameFilter);
  if (r.err) return r;

  return ok({
    name: rootDirectoryName,
    children: r.val,
  });
};

const scanItemsUnderItemById = async (
  client: MsGraphClientWrapperRest,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  const children = await client.getChildren({
    type: "itemById",
    driveId,
    itemId,
  });
  if (children.err) return children;

  const r = await scanItemsUnderItems(client, children.val, folderNameFilter);
  if (r.err) return r;

  return ok({
    name: rootDirectoryName,
    children: r.val,
  });
};

const scanItemsUnderItems = async (
  client: MsGraphClientWrapperRest,
  driveItems: DriveItem[],
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree[], OneDriveItemError>> => {
  const children = filterItems(driveItems, folderNameFilter);
  const trees = await Promise.all(
    children.map((c) => scanItemsUnderItem(client, c, folderNameFilter))
  );
  return ok(trees.filter(isOk).map((v) => v.val));
};

const scanItemsUnderItem = async (
  client: MsGraphClientWrapperRest,
  driveItem: DriveItem,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  if (isFile(driveItem))
    return ok({
      name: driveItem.name,
      driveItem: driveItem,
      children: [],
    });

  const r = await scanItemsUnderItemById(
    client,
    getDriveId(driveItem),
    getItemId(driveItem),
    folderNameFilter
  );
  return r;
};
