import { Client } from "@microsoft/microsoft-graph-client";
import { Result, ok, err } from "../../../util";
import type { DriveItem, DriveItemAsFile, DriveItemAsFolder } from "./types";

type FolderChildrenResult = {
  "@odata.context"?: string;
  "@odata.nextLink"?: string;
  value: DriveItem[];
};

export const scanAllItems = async (
  client: Client,
  ignoreFolderNames: ReadonlySet<string>
): Promise<Result<DriveItem[]>> => {
  // NOTE: https://docs.microsoft.com/en-us/graph/api/driveitem-search?view=graph-rest-1.0&tabs=http
  const rootScanApi = "/me/drive/root/children";
  const myItems = await scanFolderTreeRaw(
    client,
    rootScanApi,
    ignoreFolderNames
  );

  if (myItems.err) return myItems;

  const sharedScanApi = "/me/drive/sharedWithMe";
  const sharedItems = await scanFolderTreeRaw(
    client,
    sharedScanApi,
    ignoreFolderNames
  );

  if (sharedItems.err) return sharedItems;

  return ok([...myItems.val, ...sharedItems.val]);
};

const scanFolderTreeRaw = async (
  client: Client,
  initialAPi: string,
  ignoreFolderNames: ReadonlySet<string>
): Promise<Result<DriveItem[]>> => {
  const children = await scanFolderRaw(client, initialAPi, ignoreFolderNames);
  if (children.err) return children;

  const scanChild = async (v: DriveItem): Promise<DriveItem[]> => {
    if (!isFolder(v)) return [];
    const r = await scanFolderTreeRaw(
      client,
      getScanApi(getDriveId(v), getItemId(v)),
      ignoreFolderNames
    );
    if (r.err) throw new Error();
    return r.val;
  };

  try {
    const childScans = await Promise.all(children.val.map((v) => scanChild(v)));
    return ok([...children.val, ...childScans.flat()]);
  } catch (e) {
    return err(e);
  }
};

const getScanApi = (driveId: string, itemId: string): string =>
  `/drives/${driveId}/items/${itemId}/children`;

const scanFolderRaw = async (
  client: Client,
  initialAPi: string,
  ignoreFolderNames: ReadonlySet<string>
): Promise<Result<DriveItem[]>> => {
  const values: DriveItem[] = [];
  let scanApi = initialAPi;
  try {
    while (true) {
      const r: FolderChildrenResult = await client.api(scanApi).get();
      values.push(...r.value);
      console.log(r);
      if (!r["@odata.nextLink"]) break;
      scanApi = r["@odata.nextLink"];
    }
  } catch (e) {
    return err(e);
  }
  return ok(
    values.filter(
      (v) => !("folder" in v && ignoreFolderNames.has(v.name.toLowerCase()))
    )
  );
};

const isFile = (v: DriveItem): v is DriveItemAsFile => {
  return "file" in v;
};

const isFolder = (v: DriveItem): v is DriveItemAsFolder => {
  return "folder" in v || ("remoteItem" in v && "folder" in v.remoteItem!);
};

const getDriveId = (v: DriveItem): string => {
  if ("remoteItem" in v) return v.remoteItem!.parentReference.driveId;
  if ("parentReference" in v) return v.parentReference!.driveId;
  throw new Error(`Drive id not found. item: ${v}`);
};

const getItemId = (v: DriveItem): string => {
  if ("remoteItem" in v) return v.remoteItem!.id;
  return v.id;
};
