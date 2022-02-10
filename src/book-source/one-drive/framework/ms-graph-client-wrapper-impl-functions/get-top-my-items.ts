import { CommonOnlineError } from "../../../../core";
import { Result, err } from "../../../../results";
import type {
  DriveItem,
  MsGraphClientType,
} from "../../interface-adapter/types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";

const rootChildrenApi = (): string => "/me/drive/root/children";

export const getTopMyItems = async (
  client: MsGraphClientType,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], CommonOnlineError>> => {
  const r = await getFolderChildrenRaw(
    client,
    rootChildrenApi(),
    folderNameFilter
  );
  if (r.err) return err("offline");
  return r;
};
