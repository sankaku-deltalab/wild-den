import axios from "axios";
import { OnlineItemError } from "../../../../core";
import { Result, ok, err } from "../../../../results";
import type {
  DriveItem,
  MsGraphClientType,
} from "../../interface-adapter/types";
import { blobToBase64 } from "../../interface-adapter/util";

const driveItemApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}`;

export const getItem = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string
): Promise<Result<DriveItem, OnlineItemError>> => {
  const api = driveItemApi(driveId, itemId);
  const r: DriveItem = await client.api(api).get();
  return ok(r);
};
