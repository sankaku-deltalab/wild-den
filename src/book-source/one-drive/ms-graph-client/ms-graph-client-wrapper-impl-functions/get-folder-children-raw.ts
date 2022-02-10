import { offlineError } from "../../../../core";
import { Result, ok, err } from "../../../../results";
import { OneDriveItemError } from "../../one-drive-error";
import type {
  DriveItem,
  FolderChildrenResult,
  MsGraphClientType,
} from "../../types";

export const getFolderChildrenRaw = async (
  client: MsGraphClientType,
  initialAPi: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OneDriveItemError>> => {
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
    // TODO: check error type
    return err(offlineError());
  }
  return ok(values.filter((v) => !("folder" in v && folderNameFilter(v.name))));
};
