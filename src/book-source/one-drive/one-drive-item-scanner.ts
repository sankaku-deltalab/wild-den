import { singleton, injectable } from "tsyringe";
import { Result, ok } from "../../util";
import { OneDriveItemScanner } from "../../use-cases/one-drive/get-one-drive-book-source";
import {
  MsGraphClientType,
  OneDriveItemDetail,
} from "../../use-cases/one-drive/types";
import {
  ClientWrapper,
  getDriveId,
  getItemId,
  getPath,
  isFile,
} from "./client-wrapper";

@singleton()
@injectable()
export class OneDriveItemScannerImpl implements OneDriveItemScanner {
  async scanItemsUnderFolder(
    client: MsGraphClientType,
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItemDetail[], "offline" | "not exists">> {
    const wrapper = new ClientWrapper(client);
    const r = await wrapper.scanFolderItems(driveId, itemId, folderNameFilter);
    if (r.err) return r;

    const items: OneDriveItemDetail[] = r.val.filter(isFile).map((v) => ({
      name: v.name,
      driveId: getDriveId(v),
      itemId: getItemId(v),
      path: getPath(v),
      mimeType: v.file.mimeType,
    }));

    return ok(items);
  }
}
