import { singleton, injectable } from "tsyringe";
import { OneDriveRoot, MsGraphClientType, OneDriveItem } from "./types";
import { Result, ok, err } from "../../util";

export interface OneDriveTopItemsGetter {
  getTopMyFolders(
    client: MsGraphClientType,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline">>;

  getTopSharedFolders(
    client: MsGraphClientType,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline">>;
}

@singleton()
@injectable()
export class getRootItems {
  constructor(private readonly wrapper: OneDriveTopItemsGetter) {}

  async run(
    client: MsGraphClientType,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveRoot, "offline">> {
    const [r1, r2] = await Promise.all([
      this.wrapper.getTopMyFolders(client, folderNameFilter),
      this.wrapper.getTopSharedFolders(client, folderNameFilter),
    ]);
    if (r1.err) return r1;
    if (r2.err) return r2;
    return ok({ myItems: r1.val, sharedItems: r2.val });
  }
}
