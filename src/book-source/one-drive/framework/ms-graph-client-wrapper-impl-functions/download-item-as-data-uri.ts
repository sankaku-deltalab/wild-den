import ky from "ky";
import {
  DataUri,
  LoadProgressCallback,
  OnlineItemError,
} from "../../../../core";
import { Result, ok, err } from "../../../../results";
import type {
  DriveItemAsFile,
  MsGraphClientType,
} from "../../interface-adapter/types";
import { blobToBase64, isFile } from "../../interface-adapter/util";
import { getItem } from "./get-item";

export const downloadItemAsDataUri = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string,
  loadProgressCallback: LoadProgressCallback
): Promise<Result<[DriveItemAsFile, DataUri], OnlineItemError>> => {
  const item = await getItem(client, driveId, itemId);
  if (item.err) return item;
  if (!isFile(item.val)) return err("not exists");

  const r = await ky.get(item.val["@microsoft.graph.downloadUrl"], {
    onDownloadProgress: (progress) =>
      loadProgressCallback(progress.transferredBytes, progress.totalBytes),
  });
  if (r.status !== 200) return err("not exists");
  const file = await r.blob();
  const base64Item = await blobToBase64(file);
  return ok([item.val, base64Item]);
};
