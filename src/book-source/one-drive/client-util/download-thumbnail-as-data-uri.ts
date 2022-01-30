import { Client } from "@microsoft/microsoft-graph-client";
import { Result, err } from "../../../util";

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
  client: Client,
  driveId: string,
  itemId: string
): Promise<Result<string, unknown>> => {
  return err("not implemented");
};
