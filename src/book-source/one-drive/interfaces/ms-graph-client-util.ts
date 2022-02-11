import { MsGraphClientWrapper } from ".";
import { Result } from "../../../results";
import { OneDriveDirectoryId } from "../../../use-cases/book-sources/one-drive";
import { OneDriveItemError } from "../one-drive-error";
import { DriveItem } from "../types";

export interface MsGraphClientUtil {
  scanItemsUnderFolder(
    client: MsGraphClientWrapper,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>>;

  getFolderChildrenItems(
    client: MsGraphClientWrapper,
    directoryId: OneDriveDirectoryId,
    folderNameFilter: (name: string) => boolean
  ): Promise<Result<DriveItem[], OneDriveItemError>>;
}
