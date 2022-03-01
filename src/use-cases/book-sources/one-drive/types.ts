import { PublicClientApplication } from "@azure/msal-browser";

export type MsalInstanceType = PublicClientApplication;

export type OneDriveDirectoryId =
  | DefaultDirectoryId
  | TopMyDirectoryId
  | TopSharedDirectoryId;

export type DefaultDirectoryId = {
  type: "folder";
  driveId: string;
  itemId: string;
};

type TopMyDirectoryId = {
  type: "topMyItems";
};

type TopSharedDirectoryId = {
  type: "topShared";
};
