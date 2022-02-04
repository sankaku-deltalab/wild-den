import type { DriveItem, DriveItemAsFile, DriveItemAsFolder } from "./types";

export const blobToBase64 = async (b: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") resolve("");
      else resolve(reader.result);
    };
    reader.readAsDataURL(b);
  });
};

export const isFile = (v: DriveItem): v is DriveItemAsFile => {
  return "file" in v;
};

export const isFolder = (v: DriveItem): v is DriveItemAsFolder => {
  return "folder" in v || ("remoteItem" in v && "folder" in v.remoteItem!);
};

export const getDriveId = (v: DriveItem): string => {
  if ("remoteItem" in v) return v.remoteItem!.parentReference.driveId;
  if ("parentReference" in v) return v.parentReference!.driveId;
  throw new Error(`Drive id not found. item: ${v}`);
};

export const getItemId = (v: DriveItem): string => {
  if ("remoteItem" in v) return v.remoteItem!.id;
  return v.id;
};

export const getPath = (v: DriveItem): string => {
  if ("parentReference" in v) return v.parentReference!.path;
  if ("remoteItem" in v) return v.remoteItem!.parentReference.path;
  return "";
};
