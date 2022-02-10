import ky from "ky";
import { DataUri, LoadProgressCallback } from "../../../../core";
import { Result, ok, err } from "../../../../results";
import {
  OneDriveItemError,
  oneDriveItemNotExistsError,
} from "../../one-drive-error";
import type { DriveItemAsFile, MsGraphClientType } from "../../types";
import { blobToBase64, isFile } from "../../util";
import { getItem } from "./get-item";

export const downloadItemAsDataUri = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string,
  loadProgressCallback: LoadProgressCallback
): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>> => {
  const item = await getItem(client, driveId, itemId);
  if (item.err) return item;
  if (!isFile(item.val))
    return err(oneDriveItemNotExistsError(driveId, itemId));

  const r = await ky.get(item.val["@microsoft.graph.downloadUrl"], {
    onDownloadProgress: (progress) =>
      loadProgressCallback(progress.transferredBytes, progress.totalBytes),
  });
  if (r.status !== 200) return err(oneDriveItemNotExistsError(driveId, itemId));
  const file = await r.blob();
  const base64Item = await blobToBase64(file);
  return ok([item.val, base64Item]);
};
