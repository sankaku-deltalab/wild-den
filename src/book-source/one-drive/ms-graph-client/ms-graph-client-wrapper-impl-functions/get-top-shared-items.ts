import { CommonOnlineError, offlineError } from "../../../../core";
import { Result, err } from "../../../../results";
import type { DriveItem, MsGraphClientType } from "../../types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";

const sharedChildrenAPi = (): string => "/me/drive/sharedWithMe";

export const getTopSharedItems = async (
  client: MsGraphClientType,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], CommonOnlineError>> => {
  const r = await getFolderChildrenRaw(
    client,
    sharedChildrenAPi(),
    folderNameFilter
  );
  if (r.err) return err(offlineError());
  return r;
};
