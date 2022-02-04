import { Result, ok, isOk } from "../../../util";
import { MsGraphClientType } from "../../../use-cases/one-drive/types";
import { getFolderChildren } from "./client-util/get-folder-children";
import type { DriveItem } from "./client-util/types";
import { getDriveId, getItemId, isFolder } from "./client-util/util";

export const scanFolderTree = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], "offline" | "not exists">> => {
  const children = await getFolderChildren(
    client,
    driveId,
    itemId,
    folderNameFilter
  );
  if (children.err) return children;

  const scanChild = async (
    v: DriveItem
  ): Promise<Result<DriveItem[], "offline" | "not exists">> => {
    if (!isFolder(v)) return ok([]);
    const r = await scanFolderTree(
      client,
      getDriveId(v),
      getItemId(v),
      folderNameFilter
    );
    return r;
  };

  const childScans = await Promise.all(children.val.map((v) => scanChild(v)));
  for (const r of childScans) {
    if (r.err) return r;
  }
  return ok([
    ...children.val,
    ...childScans
      .filter(isOk)
      .map((v) => v.val)
      .flat(),
  ]);
};
