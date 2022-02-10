import { OnlineBookError } from "../../../../core";
import { Result, ok, err } from "../../../../results";
import type {
  DriveItem,
  FolderChildrenResult,
  MsGraphClientType,
} from "../../interface-adapter/types";

export const getFolderChildrenRaw = async (
  client: MsGraphClientType,
  initialAPi: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], OnlineBookError>> => {
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
    return err("offline");
  }
  return ok(values.filter((v) => !("folder" in v && folderNameFilter(v.name))));
};
