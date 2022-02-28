import { offlineError } from "../../../../../core";
import { Result, ok, err } from "../../../../../results";
import { OneDriveItemError } from "../../../one-drive-error";
import type {
  DriveItem,
  FolderChildrenResult,
  MsGraphClientType,
} from "../../../types";
import { isFile, isFolder, isSpecialFolder } from "../../../util";

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
      if (!r["@odata.nextLink"]) break;
      scanApi = r["@odata.nextLink"];
    }
  } catch (e) {
    // TODO: check error type
    return err(offlineError());
  }
  const valuesNotSpecial = values.filter((v) => !isSpecialFolder(v));
  const notFileAndNotFolderItem = valuesNotSpecial.filter(
    (v) => !isFile(v) && !isFolder(v)
  );
  const fileItems = valuesNotSpecial.filter((v) => isFile(v));
  const folderItems = valuesNotSpecial.filter(
    (v) => isFolder(v) && folderNameFilter(v.name)
  );
  return ok([...notFileAndNotFolderItem, ...fileItems, ...folderItems]);
};
