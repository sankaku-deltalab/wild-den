import { Result, ok } from "../../../../../results";
import { OneDriveItemError } from "../../../one-drive-error";
import type { MsGraphClientType } from "../../../types";
import { appFolderItemByPathApi } from "./api-url";

export const deleteItemInAppFolder = async (
  client: MsGraphClientType,
  parentPath: string[],
  itemName: string
): Promise<Result<void, OneDriveItemError>> => {
  const api = appFolderItemByPathApi(parentPath, itemName);
  await client.api(api).delete();
  return ok(undefined);
};
