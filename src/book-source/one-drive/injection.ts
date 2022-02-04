import { container } from "tsyringe";
import { injectTokens } from "../../use-cases/one-drive/injectTokens";
import {
  GetOneDriveBookSource,
  GetFolderChildrenFolder,
} from "../../use-cases/one-drive";
import { OneDriveDownloaderImpl } from "./one-drive-downloader";
import { OneDriveFolderChildrenGetterImpl } from "./one-drive-folder-children-getter";
import { OneDriveItemScannerImpl } from "./one-drive-item-scanner";
import { OneDriveLoginIdGetterImpl } from "./one-drive-login-id-getter";

const injectionPairs = {
  [injectTokens.OneDriveFolderChildrenGetter]: OneDriveFolderChildrenGetterImpl,
  [injectTokens.OneDriveLoginIdGetter]: OneDriveLoginIdGetterImpl,
  [injectTokens.OneDriveItemScanner]: OneDriveItemScannerImpl,
  [injectTokens.OneDriveDownloader]: OneDriveDownloaderImpl,
  [injectTokens.GetFolderChildrenFolder]: GetFolderChildrenFolder,
  [injectTokens.GetOneDriveBookSource]: GetOneDriveBookSource,
};

Object.entries(injectionPairs).forEach(([token, cls]) => {
  container.register(token, {
    useValue: cls,
  });
});
