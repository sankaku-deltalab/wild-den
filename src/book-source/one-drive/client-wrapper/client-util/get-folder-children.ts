import { Result } from "../../../../util";
import { MsGraphClientType } from "../../../../use-cases/one-drive/types";
import type { DriveItem } from "./types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";

const folderChildrenApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}/children`;

export const getFolderChildren = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], "offline" | "not exists">> => {
  return await getFolderChildrenRaw(
    client,
    folderChildrenApi(driveId, itemId),
    folderNameFilter
  );
};
