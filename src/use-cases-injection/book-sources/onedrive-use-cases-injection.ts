import { container } from "tsyringe";
import "../../injection";
import {
  LoginToOneDrive,
  LoginToOneDriveImpl,
} from "../../use-cases/book-sources/one-drive";
import {
  GetMsalInstance,
  GetMsalInstanceImpl,
} from "../../use-cases/book-sources/one-drive/get-msal-instance";

export const getMsalInstance =
  container.resolve<GetMsalInstance>(GetMsalInstanceImpl);
export const loginToOneDrive =
  container.resolve<LoginToOneDrive>(LoginToOneDriveImpl);
