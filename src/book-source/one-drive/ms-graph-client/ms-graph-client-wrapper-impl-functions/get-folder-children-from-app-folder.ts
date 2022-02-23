import { getFolderChildrenRaw } from ".";
import { Result } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type { DriveItem, MsGraphClientType } from "../../types";

// https://docs.microsoft.com/en-us/onedrive/developer/rest-api/concepts/special-folders-appfolder?view=odsp-graph-online
export const appFolderItemChildrenByPathApi = (
  folders: string[],
  fileName: string
): string => {
  const folderPath = folders.join("/");
  return `/drive/special/approot:/${folderPath}/${fileName}:/children`;
};

export const getFolderChildrenFromAppFolder = async (
  client: MsGraphClientType,
  parentPath: string[],
  folderName: string
): Promise<Result<DriveItem[], OneDriveItemError>> => {
  const api = appFolderItemChildrenByPathApi(parentPath, folderName);
  return await getFolderChildrenRaw(client, api, () => true);
};
