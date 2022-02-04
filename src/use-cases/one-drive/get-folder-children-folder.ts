import { inject, injectable, singleton } from "tsyringe";
import { OneDriveItem, MsGraphClientType } from "./types";
import { injectTokens as it } from "./injectTokens";
import { Result } from "../../util";

export interface OneDriveFolderChildrenGetter {
  run(
    client: MsGraphClientType,
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline" | "not exists">>;
}

@singleton()
@injectable()
export class GetFolderChildrenFolder {
  constructor(
    @inject(it.OneDriveLoginIdGetter)
    private readonly wrapper: OneDriveFolderChildrenGetter
  ) {}

  async run(
    client: MsGraphClientType,
    driveId: string,
    itemId: string,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<OneDriveItem[], "offline" | "not exists">> {
    return await this.wrapper.run(client, driveId, itemId, folderNameFilter);
  }
}
