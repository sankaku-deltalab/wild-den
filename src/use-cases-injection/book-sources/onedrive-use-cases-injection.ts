import { container } from "tsyringe";
import {
  LoginToOneDrive,
  LoginToOneDriveImpl,
} from "../../use-cases/book-sources/one-drive";

export const loginToOneDrive: LoginToOneDrive =
  container.resolve(LoginToOneDriveImpl);
