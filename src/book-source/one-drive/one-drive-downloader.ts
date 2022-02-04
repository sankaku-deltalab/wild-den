import { singleton, injectable } from "tsyringe";
import { Result } from "../../util";
import { OneDriveDownloader } from "../../use-cases/one-drive/get-one-drive-book-source";
import { MsGraphClientType } from "../../use-cases/one-drive/types";
import { ClientWrapper } from "./client-wrapper";

@singleton()
@injectable()
export class OneDriveDownloaderImpl implements OneDriveDownloader {
  downloadItem(
    client: MsGraphClientType,
    driveId: string,
    itemId: string
  ): Promise<Result<string, "offline" | "not exists">> {
    const wrapper = new ClientWrapper(client);
    return wrapper.downloadItemAsDataUri(driveId, itemId);
  }

  downloadThumbnail(
    client: MsGraphClientType,
    driveId: string,
    itemId: string
  ): Promise<Result<string, "offline" | "not exists">> {
    const wrapper = new ClientWrapper(client);
    return wrapper.downloadItemAsDataUri(driveId, itemId);
  }
}
