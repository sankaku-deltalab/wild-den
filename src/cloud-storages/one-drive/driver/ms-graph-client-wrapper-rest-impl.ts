import { offlineError } from "../../../core";
import { ok, err, Result } from "../../../results";
import {
  DriveItemId,
  EditableDriveItemId,
  MsGraphClientWrapperRest,
} from "../interfaces/ms-graph-client-wrapper-rest";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem, FolderChildrenResult, MsGraphClientType } from "../types";
import { isSpecialFolder } from "../util";

const getItemUrl = (itemId: DriveItemId): string | undefined => {
  if (itemId.type === "root") {
    return "/v1.0/me/drive/root/";
  }
  if (itemId.type === "sharedRoot") {
    // NOTE: shared folders root could not access.
    return undefined;
  }
  if (itemId.type === "itemById") {
    return `/drives/${itemId.driveId}/items/${itemId.itemId}/`;
  }
  if (itemId.type === "myItemByPath") {
    throw new Error("not implemented");
  }
  if (itemId.type === "appRoot") {
    return "/me/drive/special/approot/";
  }
  if (itemId.type === "appItemByPath") {
    const parents = itemId.parentPath;
    const itemName = itemId.itemName;
    if (parents.length === 0) return `/me/drive/special/approot:/${itemName}:/`;

    return `/me/drive/special/approot:/${parents.join("")}/${itemName}:/`;
  }
  throw new Error(`Unknown DriveItemId type: ${itemId}`);
};

const getChildrenUrl = (parentItemId: DriveItemId): string | undefined => {
  if (parentItemId.type === "sharedRoot") {
    // NOTE: shared folders root could not access.
    return "/me/drive/sharedWithMe";
  }
  return getItemUrl(parentItemId) + "children";
};

const apiWrap = async <T>(
  func: () => Promise<T>
): Promise<Result<T, OneDriveItemError>> => {
  try {
    const r = await func();
    return ok(r);
  } catch (e) {
    // TODO: check exception
    return err(offlineError());
  }
};

/**
 * Created by MsGraphClientWrapperRestFactory.
 */
export class MsGraphClientWrapperRestImpl implements MsGraphClientWrapperRest {
  constructor(private readonly client: MsGraphClientType) {}

  async getItem(
    itemId: EditableDriveItemId
  ): Promise<Result<DriveItem, OneDriveItemError>> {
    const url = getItemUrl(itemId);
    if (url === undefined) throw new Error("unknown api url");
    return await apiWrap(() => this.client.api(url).get<DriveItem>());
  }

  async deleteItem(
    itemId: EditableDriveItemId
  ): Promise<Result<void, OneDriveItemError>> {
    const url = getItemUrl(itemId);
    if (url === undefined) throw new Error("unknown api url");
    return await apiWrap(() => this.client.api(url).delete());
  }

  async postItem<T>(
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>> {
    const url = getItemUrl(itemId);
    if (url === undefined) throw new Error("unknown api url");
    return await apiWrap(() =>
      this.client.api(url).post<DriveItem, T>(content)
    );
  }

  async patchItem<T>(
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>> {
    const url = getItemUrl(itemId);
    if (url === undefined) throw new Error("unknown api url");
    return await apiWrap(() =>
      this.client.api(url).patch<DriveItem, T>(content)
    );
  }

  async putItem<T>(
    itemId: EditableDriveItemId,
    content: T
  ): Promise<Result<DriveItem, OneDriveItemError>> {
    const url = getItemUrl(itemId);
    if (url === undefined) throw new Error("unknown api url");
    return await apiWrap(() => this.client.api(url).put<DriveItem, T>(content));
  }

  async getChildren(
    itemId: DriveItemId
  ): Promise<Result<DriveItem[], OneDriveItemError>> {
    const url = getChildrenUrl(itemId);
    if (url === undefined) throw new Error("unknown api url");

    const values: DriveItem[] = [];
    let nextGetUrl = url;
    while (true) {
      const r = await apiWrap(() =>
        this.client.api(nextGetUrl).get<FolderChildrenResult>()
      );
      if (r.err) return r;

      values.push(...r.val.value);
      if (!r.val["@odata.nextLink"]) break;
      nextGetUrl = r.val["@odata.nextLink"];
    }
    return ok(values.filter((v) => !isSpecialFolder(v)));
  }
}
