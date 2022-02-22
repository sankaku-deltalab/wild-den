import { Result, ok } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type { DriveItemAsFolder, MsGraphClientType } from "../../types";

// https://docs.microsoft.com/en-us/onedrive/developer/rest-api/concepts/special-folders-appfolder?view=odsp-graph-online
const appRootApi = (): string => `/drive/special/approot/children`;

export const postFolderToAppRoot = async (
  client: MsGraphClientType,
  folderName: string
): Promise<Result<DriveItemAsFolder, OneDriveItemError>> => {
  const api = appRootApi();
  const content = {
    name: folderName,
    folder: {},
  };
  const r: DriveItemAsFolder = await client
    .api(api)
    .post<DriveItemAsFolder, typeof content>(content);
  // TODO: return error if item not exists
  return ok(r);
};
