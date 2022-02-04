import { Result, err } from "../../../../util";
import { MsGraphClientType } from "../../../../use-cases/one-drive/types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";
import { DriveItem } from "./types";

const rootChildrenApi = (): string => "/me/drive/root/children";

export const getTopMyItems = async (
  client: MsGraphClientType,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], "offline">> => {
  const r = await getFolderChildrenRaw(
    client,
    rootChildrenApi(),
    folderNameFilter
  );
  if (r.err) return err("offline");
  return r;
};
