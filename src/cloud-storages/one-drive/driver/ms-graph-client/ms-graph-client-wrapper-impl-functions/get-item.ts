import { Result, ok } from "../../../../../results";
import { OneDriveItemError } from "../../../one-drive-error";
import type { DriveItem, MsGraphClientType } from "../../../types";

const driveItemApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}`;

export const getItem = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string
): Promise<Result<DriveItem, OneDriveItemError>> => {
  const api = driveItemApi(driveId, itemId);
  const r: DriveItem = await client.api(api).get();
  // TODO: return error if item not exists
  return ok(r);
};
