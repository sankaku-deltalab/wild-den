import { singleton, injectable } from "tsyringe";
import { Result, ok } from "../../util";
import {
  MsGraphClientType,
  OneDriveItem,
} from "../../use-cases/one-drive/types";
import { OneDriveTopItemsGetter } from "../../use-cases/one-drive/get-top-item";
import {
  ClientWrapper,
  getDriveId,
  getItemId,
  isFolder,
} from "./client-wrapper";

@singleton()
@injectable()
export class OneDriveTopItemsGetterImpl implements OneDriveTopItemsGetter {
  async getTopMyFolders(
    client: MsGraphClientType,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline">> {
    const wrapper = new ClientWrapper(client);
    const r = await wrapper.getTopMyItems(folderNameFilter);
    if (r.err) return r;

    const rootChildren: OneDriveItem[] = r.val
      .filter((v) => isFolder(v))
      .map((v) => ({
        name: v.name,
        type: isFolder(v) ? "folder" : "file",
        driveId: getDriveId(v),
        itemId: getItemId(v),
      }));

    return ok(rootChildren);
  }

  async getTopSharedFolders(
    client: MsGraphClientType,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline">> {
    const wrapper = new ClientWrapper(client);
    const r = await wrapper.getTopSharedItems(folderNameFilter);
    if (r.err) return r;

    const rootChildren: OneDriveItem[] = r.val
      .filter((v) => isFolder(v))
      .map((v) => ({
        name: v.name,
        type: isFolder(v) ? "folder" : "file",
        driveId: getDriveId(v),
        itemId: getItemId(v),
      }));

    return ok(rootChildren);
  }
}
