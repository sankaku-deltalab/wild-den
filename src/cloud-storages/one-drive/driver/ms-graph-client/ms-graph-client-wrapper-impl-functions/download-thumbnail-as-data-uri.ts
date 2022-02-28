import { DataUri } from "../../../../../core";
import { Result, err } from "../../../../../results";
import {
  OneDriveItemError,
  oneDriveItemNotExistsError,
} from "../../../one-drive-error";
import type { DriveItemAsFile, MsGraphClientType } from "../../../types";

type ThumbnailsResult = {
  "@odata.context"?: string;
  value: {
    id: string;
    large: ThumbnailItem;
    medium: ThumbnailItem;
    small: ThumbnailItem;
  };
};

type ThumbnailItem = {
  height: number;
  width: number;
  url: string;
};

export const downloadThumbnailAsDataUri = async (
  client: MsGraphClientType,
  driveId: string,
  itemId: string
): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>> => {
  // TODO: impl this.
  return err(oneDriveItemNotExistsError(driveId, itemId));
};
