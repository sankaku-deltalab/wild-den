// type of Client from "@microsoft/microsoft-graph-client"
export interface MsGraphClientType {
  api(path: string): GraphRequestType;
}

export interface GraphRequestType {
  get<T>(): Promise<T>;
}

export type OneDriveRoot = {
  myItems: OneDriveItem[];
  sharedItems: OneDriveItem[];
};

export type OneDriveItemCore = {
  name: string;
};

export type OneDriveItem = OneDriveItemCore & {
  type: "folder" | "file";
  driveId: string;
  itemId: string;
};

export type OneDriveMyItemRoot = OneDriveItemCore & {
  name: "root";
  type: "root";
};

export type OneDriveSharedItemRoot = OneDriveItemCore & {
  name: "shared";
  type: "shared";
};

export type OneDriveItemDetail = {
  driveId: string;
  itemId: string;
  name: string;
  path: string;
  mimeType: string;
};
