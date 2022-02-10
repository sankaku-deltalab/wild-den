import { Result } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type { DriveItem, MsGraphClientType } from "../../types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";

const folderChildrenApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}/children`;

export const getFolderChildren = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OneDriveItemError>> => {
  return await getFolderChildrenRaw(
    client,
    folderChildrenApi(driveId, itemId),
    folderNameFilter
  );
};
