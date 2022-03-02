import { injectable, singleton } from "tsyringe";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalInstanceType } from "../../../use-cases/book-sources/one-drive";
import { MsalInstanceRepository } from "../../../use-cases/book-sources/one-drive/interfaces";
import { msalConfig } from "./msal/msal-config";

@singleton()
@injectable()
export class MsalInstanceRepositoryImpl implements MsalInstanceRepository {
  private readonly msalInstance = new PublicClientApplication(msalConfig);

  get(): MsalInstanceType {
    return this.msalInstance;
  }
}
