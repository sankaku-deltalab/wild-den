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
    pureClient: MsGraphClientType,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItemTree, OneDriveItemError>> {
    if (directoryId.type === "topMyItems") {
      return scanItemsUnderMyRoot(client, pureClient, folderNameFilter);
    }
    if (directoryId.type === "topShared") {
      return scanItemsUnderSharedRoot(client, pureClient, folderNameFilter);
    }
    return scanItemsUnderItemById(
      client,
      pureClient,
      directoryId.driveId,
      directoryId.itemId,
      folderNameFilter
    );
  }

  async getItemChildren(
    client: MsGraphClientWrapperRest,
    pureClient: MsGraphClientType,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>> {
    const getItemChildrenRaw = (
      client: MsGraphClientWrapperRest,
      pureClient: MsGraphClientType,
      directoryId: OneDriveDirectoryId
    ): Promise<Result<DriveItem[], OneDriveItemError>> => {
      if (directoryId.type === "topMyItems") {
        return client.getChildren(pureClient, { type: "appRoot" });
      }
      if (directoryId.type === "topShared") {
        return client.getChildren(pureClient, { type: "sharedRoot" });
      }
      return client.getChildren(pureClient, {
        type: "itemById",
        driveId: directoryId.driveId,
        itemId: directoryId.itemId,
      });
    };
    const r = await getItemChildrenRaw(client, pureClient, directoryId);
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
  pureClient: MsGraphClientType,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  const children = await client.getChildren(pureClient, { type: "root" });
  if (children.err) return children;

  const r = await scanItemsUnderItems(
    client,
    pureClient,
    children.val,
    folderNameFilter
  );
  if (r.err) return r;

  return ok({
    name: rootDirectoryName,
    children: r.val,
  });
};

const scanItemsUnderSharedRoot = async (
  client: MsGraphClientWrapperRest,
  pureClient: MsGraphClientType,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  const children = await client.getChildren(pureClient, { type: "sharedRoot" });
  if (children.err) return children;

  const r = await scanItemsUnderItems(
    client,
    pureClient,
    children.val,
    folderNameFilter
  );
  if (r.err) return r;

  return ok({
    name: rootDirectoryName,
    children: r.val,
  });
};

const scanItemsUnderItemById = async (
  client: MsGraphClientWrapperRest,
  pureClient: MsGraphClientType,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree, OneDriveItemError>> => {
  const children = await client.getChildren(pureClient, {
    type: "itemById",
    driveId,
    itemId,
  });
  if (children.err) return children;

  const r = await scanItemsUnderItems(
    client,
    pureClient,
    children.val,
    folderNameFilter
  );
  if (r.err) return r;

  return ok({
    name: rootDirectoryName,
    children: r.val,
  });
};

const scanItemsUnderItems = async (
  client: MsGraphClientWrapperRest,
  pureClient: MsGraphClientType,
  driveItems: DriveItem[],
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItemTree[], OneDriveItemError>> => {
  const children = filterItems(driveItems, folderNameFilter);
  const trees = await Promise.all(
    children.map((c) =>
      scanItemsUnderItem(client, pureClient, c, folderNameFilter)
    )
  );
  return ok(trees.filter(isOk).map((v) => v.val));
};

const scanItemsUnderItem = async (
  client: MsGraphClientWrapperRest,
  pureClient: MsGraphClientType,
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
    pureClient,
    getDriveId(driveItem),
    getItemId(driveItem),
    folderNameFilter
  );
  return r;
};
