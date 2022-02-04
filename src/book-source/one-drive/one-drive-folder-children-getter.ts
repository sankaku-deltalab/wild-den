import { singleton, injectable } from "tsyringe";
import { Result, ok } from "../../util";
import { OneDriveFolderChildrenGetter } from "../../use-cases/one-drive/get-folder-children-folder";
import {
  MsGraphClientType,
  OneDriveItem,
} from "../../use-cases/one-drive/types";
import {
  ClientWrapper,
  getDriveId,
  getItemId,
  isFolder,
} from "./client-wrapper";

@singleton()
@injectable()
export class OneDriveFolderChildrenGetterImpl
  implements OneDriveFolderChildrenGetter
{
  async run(
    client: MsGraphClientType,
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline" | "not exists">> {
    const wrapper = new ClientWrapper(client);
    const r = await wrapper.scanFolderItems(driveId, itemId, folderNameFilter);
    if (r.err) return r;

    const items: OneDriveItem[] = r.val.filter(isFolder).map((v) => ({
      name: v.name,
      type: "folder",
      driveId: getDriveId(v),
      itemId: getItemId(v),
    }));

    return ok(items);
  }
}
