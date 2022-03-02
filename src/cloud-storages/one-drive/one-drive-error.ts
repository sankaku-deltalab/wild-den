import { CommonOnlineError, ErrorBase } from "../../core";

export type OneDriveItemError =
  | CommonOnlineError
  | OneDriveItemNotExistsError
  | OneDriveItemIsNotFileError;

export type OneDriveItemNotExistsError = ErrorBase<
  "onedrive item not exists",
  { driveId: string; itemId: string }
>;

export type OneDriveItemIsNotFileError = ErrorBase<
  "onedrive item is not file",
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

export const oneDriveItemIsNotFileError = (
  driveId: string,
  itemId: string
): OneDriveItemIsNotFileError => ({
  type: "onedrive item is not file",
  payload: {
    driveId,
    itemId,
  },
});
