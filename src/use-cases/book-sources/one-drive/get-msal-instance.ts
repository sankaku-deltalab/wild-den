import { inject, injectable, singleton } from "tsyringe";
import { AccountInfo } from "@azure/msal-browser";
import type { FunctionClass } from "../../../function-class";
import { injectTokens as it } from "../../../inject-tokens";
import type { MsalInstanceRepository } from "./interfaces/msal-instance-repository";
import { MsalInstanceType } from ".";

type GetMsalInstanceType = () => MsalInstanceType;

export interface GetMsalInstance extends FunctionClass<GetMsalInstanceType> {}

@singleton()
@injectable()
export class GetMsalInstanceImpl implements GetMsalInstance {
  constructor(
    @inject(it.MsalInstanceRepository)
    private readonly msalRepo: MsalInstanceRepository
  ) {}

  run() {
    return this.msalRepo.get();
  }
}
