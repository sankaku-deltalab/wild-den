import { OnlineBookError } from "../../../../core";
import { Result } from "../../../../results";
import type {
  DriveItem,
  MsGraphClientType,
} from "../../interface-adapter/types";
import { getFolderChildrenRaw } from "./get-folder-children-raw";

const folderChildrenApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}/children`;

export const getFolderChildren = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OnlineBookError>> => {
  return await getFolderChildrenRaw(
    client,
    folderChildrenApi(driveId, itemId),
    folderNameFilter
  );
};
