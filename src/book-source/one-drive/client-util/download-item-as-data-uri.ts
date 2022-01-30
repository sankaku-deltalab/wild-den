import { Client } from "@microsoft/microsoft-graph-client";
import axios from "axios";
import { Result, ok, err } from "../../../util";
import type { DriveItemAsFile } from "./types";
import { blobToBase64 } from "./util";

export const downloadItemAsDataUri = async (
  client: Client,
  driveId: string,
  itemId: string
): Promise<Result<string, unknown>> => {
  const api = `/drives/${driveId}/items/${itemId}`;
  const r: DriveItemAsFile = await client.api(api).get();

  const file = await axios.get(r["@microsoft.graph.downloadUrl"], {
    responseType: "blob",
  });
  if (file.status !== 200) return err("misc");
  const base64Item = await blobToBase64(file.data);
  return ok(base64Item);
};
