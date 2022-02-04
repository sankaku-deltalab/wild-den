import axios from "axios";
import { MsGraphClientType } from "../../../../use-cases/one-drive/types";
import { Result, ok, err } from "../../../../util";
import type { DriveItemAsFile } from "./types";
import { blobToBase64 } from "./util";

const driveItemApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}`;

export const downloadItemAsDataUri = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string
): Promise<Result<string, "offline" | "not exists">> => {
  const api = driveItemApi(driveId, itemId);
  const r: DriveItemAsFile = await client.api(api).get();

  const file = await axios.get(r["@microsoft.graph.downloadUrl"], {
    responseType: "blob",
  });
  if (file.status !== 200) return err("not exists");
  const base64Item = await blobToBase64(file.data);
  return ok(base64Item);
};
