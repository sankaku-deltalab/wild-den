import { Result, err } from "../../../../util";
import { MsGraphClientType } from "../../../../use-cases/one-drive/types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";
import { DriveItem } from "./types";

const sharedChildrenAPi = (): string => "/me/drive/sharedWithMe";

export const getTopSharedItems = async (
  client: MsGraphClientType,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], "offline">> => {
  const r = await getFolderChildrenRaw(
    client,
    sharedChildrenAPi(),
    folderNameFilter
  );
  if (r.err) return err("offline");
  return r;
};
