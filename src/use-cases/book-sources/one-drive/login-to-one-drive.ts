import { inject, injectable, singleton } from "tsyringe";
import { AccountInfo } from "@azure/msal-browser";
import type { FunctionClass } from "../../../function-class";
import { injectTokens as it } from "../../../inject-tokens";
import { MsalInstanceRepository } from "./interfaces/msal-instance-repository";

type LoginToOneDriveType = () => Promise<AccountInfo[]>;

export interface LoginToOneDrive extends FunctionClass<LoginToOneDriveType> {}

@singleton()
@injectable()
export class LoginToOneDriveImpl implements LoginToOneDrive {
  constructor(
    @inject(it.MsalInstanceRepository)
    private readonly msalRepo: MsalInstanceRepository
  ) {}

  async run(): Promise<AccountInfo[]> {
    const msalInstance = this.msalRepo.get();
    await msalInstance.loginPopup();
    return msalInstance.getAllAccounts();
  }
}
