import { Result, ok, err } from "../../../../util";
import { MsGraphClientType } from "../../../../use-cases/one-drive/types";
import type { DriveItem, FolderChildrenResult } from "./types";

export const getFolderChildrenRaw = async (
  client: MsGraphClientType,
  initialAPi: string,
  folderNameFilter: (name: string) => boolean
): Promise<Result<DriveItem[], "offline" | "not exists">> => {
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
