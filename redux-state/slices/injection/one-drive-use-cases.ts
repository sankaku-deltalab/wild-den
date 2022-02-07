import { container } from "tsyringe";
import {
  GetFolderChildrenFolder,
  GetOneDriveBookSource,
  OneDriveLoginIdGetter,
} from "../../../src/use-cases/book-sources/one-drive";
import { injectTokens as it } from "../../../src/use-cases/book-sources/one-drive/injectTokens";

export const getOneDriveFolderChildrenFolder: GetFolderChildrenFolder =
  container.resolve(it.GetFolderChildrenFolder);
export const getOneDriveBookSource: GetOneDriveBookSource = container.resolve(
  it.GetOneDriveBookSource
);
export const oneDriveLoginIdGetter: OneDriveLoginIdGetter = container.resolve(
  it.OneDriveLoginIdGetter
);
