import { PublicClientApplication } from "@azure/msal-browser";

export type MsalInstanceType = PublicClientApplication;

export type OneDriveDirectoryId = {
  driveId: string;
  itemId: string;
};
