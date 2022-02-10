import { CommonOnlineError, ErrorBase } from "../../core";

export type OneDriveItemError = CommonOnlineError | OneDriveItemNotExistsError;

export type OneDriveItemNotExistsError = ErrorBase<
  "onedrive item not exists",
  { driveId: string; itemId: string }
>;

export const oneDriveItemNotExistsError = (
  driveId: string,
  itemId: string
): OneDriveItemNotExistsError => ({
  type: "onedrive item not exists",
  payload: {
    driveId,
    itemId,
  },
});
