export type OneDriveFileId = string; // `<driveId> <itemId>`

export const encodeOneDriveFileId = (
  driveId: string,
  itemId: string
): OneDriveFileId => `${driveId} ${itemId}`;

export const decodeOneDriveFileId = (
  fileId: OneDriveFileId
): { driveId: string; itemId: string } => {
  const [driveId, itemId] = fileId.split(" ");
  return { driveId, itemId };
};
