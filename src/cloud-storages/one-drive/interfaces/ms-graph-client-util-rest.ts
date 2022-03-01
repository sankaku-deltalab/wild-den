import { DataUri } from "../../../core";
import { LoadProgressCallback } from "../../../core/interfaces";
import { Result } from "../../../results";
import {
  DefaultDirectoryId,
  OneDriveDirectoryId,
} from "../../../use-cases/book-sources/one-drive";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem, DriveItemAsFile, MsGraphClientType } from "../types";
import { MsGraphClientWrapperRest } from "./ms-graph-client-wrapper-rest";

export type DriveItemTree = {
  name: string;
  driveItem?: DriveItem;
  children: DriveItemTree[];
};

export interface MsGraphClientUtilRest {
  scanItemsUnderItem(
    client: MsGraphClientWrapperRest,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItemTree, OneDriveItemError>>;

  getItemChildren(
    client: MsGraphClientWrapperRest,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>>;

  downloadItemById(
    client: MsGraphClientWrapperRest,
    directoryId: DefaultDirectoryId,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>>;

  downloadItemFromAppFolderByPath(
    client: MsGraphClientWrapperRest,
    parentPath: string[],
    fileName: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<[DriveItemAsFile, DataUri], OneDriveItemError>>;
}
