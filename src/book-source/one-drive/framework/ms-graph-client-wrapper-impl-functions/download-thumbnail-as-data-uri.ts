import { DataUri, OnlineBookError } from "../../../../core";
import { Result, err } from "../../../../results";
import type {
  DriveItemAsFile,
  MsGraphClientType,
} from "../../interface-adapter/types";

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
): Promise<Result<[DriveItemAsFile, DataUri], OnlineBookError>> => {
  // TODO: impl this.
  return err("not exists");
};
