import { inject, injectable, singleton } from "tsyringe";
import { AccountInfo } from "@azure/msal-browser";
import { injectTokens as it } from "../../../inject-tokens";
import { err, Result, ok } from "../../../results";
import {
  SourceId,
  SourceIdStr,
  sourceIdToStr,
  sourceNotAvailableError,
  SourceNotAvailableError,
} from "../../../core";
import {
  MsalInstanceType,
  msGraphScopes,
} from "../../../use-cases/book-sources/one-drive";
import { getMsGraphClient } from "./get-ms-graph-client";
import { msalInstanceAccountToSourceId } from "../util";
import { MsGraphClientWrapperRestFactory } from "../interfaces/ms-graph-client-wrapper-rest-factory";
import { MsGraphClientWrapperRest } from "../interfaces/ms-graph-client-wrapper-rest";
import type { MsalInstanceRepository } from "../../../use-cases/book-sources/one-drive/interfaces";
import { MsGraphClientWrapperRestImpl } from "./ms-graph-client-wrapper-rest-impl";

@singleton()
@injectable()
export class MsGraphClientWrapperRestFactoryImpl
  implements MsGraphClientWrapperRestFactory
{
  constructor(
    @inject(it.MsalInstanceRepository)
    private readonly msalRepo: MsalInstanceRepository
  ) {}

  getClientWrappers(): Record<SourceIdStr, MsGraphClientWrapperRest> {
    const msalInstance = this.msalRepo.get();
    const accounts = this.msalRepo.get().getAllAccounts();
    return Object.fromEntries(
      accounts.map((a) => [
        sourceIdToStr(msalInstanceAccountToSourceId(a)),
        this.getClientWrapperRaw(a, msalInstance),
      ])
    );
  }

  getClientWrapper(
    sourceId: SourceId
  ): Result<MsGraphClientWrapperRest, SourceNotAvailableError> {
    const wrappers = this.getClientWrappers();

    const sidStr = sourceIdToStr(sourceId);
    if (!(sidStr in wrappers)) return err(sourceNotAvailableError(sourceId));
    return ok(wrappers[sidStr]);
  }

  private getClientWrapperRaw(
    account: AccountInfo,
    msalInstance: MsalInstanceType
  ): MsGraphClientWrapperRest {
    // Should I use cache?
    const pureClient = getMsGraphClient(account, msGraphScopes, msalInstance);
    return new MsGraphClientWrapperRestImpl(pureClient);
  }
}
