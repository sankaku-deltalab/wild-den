import { Result, ok } from "../../../../../results";
import { OneDriveItemError } from "../../../one-drive-error";
import type { DriveItemAsFile, MsGraphClientType } from "../../../types";
import { appFolderItemContentByPathApi } from "./api-url";

export const putSmallTextToAppRoot = async (
  client: MsGraphClientType,
  folders: string[],
  fileName: string,
  content: string
): Promise<Result<DriveItemAsFile, OneDriveItemError>> => {
  const api = appFolderItemContentByPathApi(folders, fileName);
  const r: DriveItemAsFile = await client
    .api(api)
    .put<DriveItemAsFile, typeof content>(content);
  // TODO: return error if item not exists
  return ok(r);
};
