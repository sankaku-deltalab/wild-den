import { FileId } from "../../core";

export const fileIdToDriveItemId = (fileId: FileId): [string, string] => {
  const [driveId, itemId] = fileId.split(" ");
  return [driveId, itemId];
};

export const driveItemIdToFileId = (
  driveId: string,
  itemId: string
): FileId => {
  return `${driveId} ${itemId}`;
};
