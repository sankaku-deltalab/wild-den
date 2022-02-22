import { Result, ok } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type { DriveItemAsFile, MsGraphClientType } from "../../types";

// https://docs.microsoft.com/en-us/onedrive/developer/rest-api/concepts/special-folders-appfolder?view=odsp-graph-online
const appFolderItemByPathApi = (
  folders: string[],
  fileName: string
): string => {
  const folderPath = folders.join("/");
  return `/drive/special/approot:/${folderPath}/${fileName}:/content`;
};

export const putSmallTextToAppRoot = async (
  client: MsGraphClientType,
  folders: string[],
  fileName: string,
  content: string
): Promise<Result<DriveItemAsFile, OneDriveItemError>> => {
  const api = appFolderItemByPathApi(folders, fileName);
  const r: DriveItemAsFile = await client
    .api(api)
    .put<DriveItemAsFile, typeof content>(content);
  // TODO: return error if item not exists
  return ok(r);
};
