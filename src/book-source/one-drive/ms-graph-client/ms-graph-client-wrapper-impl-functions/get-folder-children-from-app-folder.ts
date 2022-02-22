import { getFolderChildrenRaw } from ".";
import { Result } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type { DriveItem, MsGraphClientType } from "../../types";
import { appFolderItemByPathApi } from "./api-url";

export const getFolderChildrenFromAppFolder = async (
  client: MsGraphClientType,
  folders: string[],
  fileName: string
): Promise<Result<DriveItem[], OneDriveItemError>> => {
  const api = appFolderItemByPathApi(folders, fileName);
  return await getFolderChildrenRaw(client, api, () => true);
};
