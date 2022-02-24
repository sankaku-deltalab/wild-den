import ky from "ky";
import { DataUri } from "../../../../core";
import { LoadProgressCallback } from "../../../../core/interfaces";
import { Result, ok, err } from "../../../../results";
import {
  OneDriveItemError,
  oneDriveItemNotExistsError,
} from "../../one-drive-error";
import type {
  DriveItem,
  DriveItemAsFile,
  MsGraphClientType,
} from "../../types";
import { blobToBase64, getDriveId, getItemId, isFile } from "../../util";
import { appFolderItemContentByPathApi } from "./api-url";

export const downloadAppFolderItemAsDataUri = async (
  client: MsGraphClientType,
  folders: string[],
  fileName: string,
  loadProgressCallback: LoadProgressCallback
): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>> => {
  const api = appFolderItemContentByPathApi(folders, fileName);
  const item = await client.api(api).get<DriveItem>();
  if (!isFile(item))
    return err(oneDriveItemNotExistsError(getDriveId(item), getItemId(item)));

  const r = await ky.get(item["@microsoft.graph.downloadUrl"], {
    onDownloadProgress: (progress) =>
      loadProgressCallback(progress.transferredBytes, progress.totalBytes),
  });
  if (r.status !== 200)
    return err(oneDriveItemNotExistsError(getDriveId(item), getItemId(item)));
  const file = await r.blob();
  const base64Item = await blobToBase64(file);
  return ok([item, base64Item]);
};
