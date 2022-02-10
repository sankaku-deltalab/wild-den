import { injectable, singleton } from "tsyringe";
import { OnlineBookError } from "../../../core";
import { Result, ok, isOk } from "../../../results";
import { OneDriveDirectoryId } from "../../../use-cases/book-sources/one-drive";
import { DriveItem, MsGraphClientWrapper } from "./types";
import { getDriveId, getItemId, isFolder } from "./util";

export interface MsGraphClientUtil {
  scanItemsUnderFolder(
    client: MsGraphClientWrapper,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OnlineBookError>>;

  getFolderChildrenItems(
    client: MsGraphClientWrapper,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OnlineBookError>>;
}

@singleton()
@injectable()
export class MsGraphClientUtilImpl implements MsGraphClientUtil {
  scanItemsUnderFolder(
    client: MsGraphClientWrapper,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OnlineBookError>> {
    if (directoryId.type === "topMyItems") {
      return scanTopMyItemsFolderTree(client, folderNameFilter);
    }
    if (directoryId.type === "topShared") {
      return scanTopSharedFolderTree(client, folderNameFilter);
    }
    return scanFolderTree(
      client,
      directoryId.driveId,
      directoryId.itemId,
      folderNameFilter
    );
  }

  getFolderChildrenItems(
    client: MsGraphClientWrapper,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OnlineBookError>> {
    if (directoryId.type === "topMyItems") {
      return client.getTopMyItems(folderNameFilter);
    }
    if (directoryId.type === "topShared") {
      return client.getTopSharedItems(folderNameFilter);
    }
    return client.getFolderChildrenItems(
      directoryId.driveId,
      directoryId.itemId,
      folderNameFilter
    );
  }
}

const scanTopMyItemsFolderTree = async (
  client: MsGraphClientWrapper,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OnlineBookError>> => {
  const children = await client.getTopMyItems(folderNameFilter);
  if (children.err) return children;

  return scanDriveItems(client, children.val, folderNameFilter);
};

const scanTopSharedFolderTree = async (
  client: MsGraphClientWrapper,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OnlineBookError>> => {
  const children = await client.getTopSharedItems(folderNameFilter);
  if (children.err) return children;

  return scanDriveItems(client, children.val, folderNameFilter);
};

const scanFolderTree = async (
  client: MsGraphClientWrapper,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OnlineBookError>> => {
  const children = await client.getFolderChildrenItems(
    driveId,
    itemId,
    folderNameFilter
  );
  if (children.err) return children;

  return scanDriveItems(client, children.val, folderNameFilter);
};

const scanDriveItems = async (
  client: MsGraphClientWrapper,
  driveItems: DriveItem[],
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OnlineBookError>> => {
  const children = driveItems;

  const scanChild = async (
    v: DriveItem
  ): Promise<Result<DriveItem[], OnlineBookError>> => {
    if (!isFolder(v)) return ok([]);
    const r = await scanFolderTree(
      client,
      getDriveId(v),
      getItemId(v),
      folderNameFilter
    );
    return r;
  };

  const childScans = await Promise.all(children.map((v) => scanChild(v)));
  for (const r of childScans) {
    if (r.err) return r;
  }
  return ok([
    ...children,
    ...childScans
      .filter(isOk)
      .map((v) => v.val)
      .flat(),
  ]);
};
