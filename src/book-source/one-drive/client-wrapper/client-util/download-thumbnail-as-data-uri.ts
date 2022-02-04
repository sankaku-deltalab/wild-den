import { Result, err } from "../../../../util";
import { MsGraphClientType } from "../../../../use-cases/one-drive/types";

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
): Promise<Result<string, "offline" | "not exists">> => {
  return err("not exists");
};
