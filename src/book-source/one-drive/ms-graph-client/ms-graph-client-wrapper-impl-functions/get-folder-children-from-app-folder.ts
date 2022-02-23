import { getFolderChildrenRaw } from ".";
import { Result } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type { DriveItem, MsGraphClientType } from "../../types";
import { appFolderItemByPathApi } from "./api-url";

export const getFolderChildrenFromAppFolder = async (
  client: MsGraphClientType,
  parentPath: string[],
  folderName: string
): Promise<Result<DriveItem[], OneDriveItemError>> => {
  const api = appFolderItemByPathApi(parentPath, folderName);
  return await getFolderChildrenRaw(client, api, () => true);
};
