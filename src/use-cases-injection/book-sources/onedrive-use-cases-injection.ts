import { container } from "tsyringe";
import {
  LoginToOneDrive,
  LoginToOneDriveImpl,
} from "../../use-cases/book-sources/one-drive";
import {
  GetMsalInstance,
  GetMsalInstanceImpl,
} from "../../use-cases/book-sources/one-drive/get-msal-instance";

export const getMsalInstance: GetMsalInstance =
  container.resolve(GetMsalInstanceImpl);
export const loginToOneDrive: LoginToOneDrive =
  container.resolve(LoginToOneDriveImpl);
