export type MsGraphClientType = {
  api(api: string): GraphRequestType;
};

export type GraphRequestType = {
  get<T>(): Promise<T>;
  post<T, C>(content: C): Promise<T>;
};

export type DriveItem = DriveItemAsFolder | DriveItemAsFile;

export type DriveItemCore = {
  createdDateTime: string;
  eTag: string;
  id: string;
  lastModifiedDateTime: string;
  name: string;
  webUrl: string;
  cTag: string;
  size: number;
  fileSystemInfo: {
    createdDateTime: string;
    lastModifiedDateTime: string;
  };
  parentReference?: {
    driveId: string;
    driveType: string;
    id: string;
    path: string;
  };
  remoteItem?: {
    id: string;
    parentReference: {
      driveId: string;
      driveType: string;
      id: string;
      path: string;
    };
  };
  shared?: {
    owner: {
      user: {
        displayName: string;
        id: string;
      };
    };
  };
};

export type DriveItemAsFolder = DriveItemCore & {
  folder: {
    childCount: number;
  };
};

export type DriveItemAsFile = DriveItemCore & {
  "@microsoft.graph.downloadUrl": string;
  file: {
    mimeType: string;
    hashes: {
      quickXorHash: string;
    };
  };
};

export type FolderChildrenResult = {
  "@odata.context"?: string;
  "@odata.nextLink"?: string;
  value: DriveItem[];
};
