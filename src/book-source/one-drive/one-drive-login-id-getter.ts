import { singleton, injectable } from "tsyringe";
import { PublicClientApplication } from "@azure/msal-browser";
import { Result, ok, err } from "../../util";
import { OneDriveLoginIdGetter } from "../../use-cases/one-drive/get-one-drive-book-source";

@singleton()
@injectable()
export class OneDriveLoginIdGetterImpl implements OneDriveLoginIdGetter {
  constructor(private readonly msalInstance: PublicClientApplication) {}
  getLoginId(): Result<string, "offline"> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) return err("offline");
    return ok(accounts[0].homeAccountId);
  }
}
