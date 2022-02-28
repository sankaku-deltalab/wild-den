import { injectable, singleton } from "tsyringe";
import { AccountInfo } from "@azure/msal-browser";
import {
  SourceId,
  SourceIdStr,
  sourceIdToStr,
  sourceNotAvailableError,
  SourceNotAvailableError,
} from "../../../../core";
import {
  MsalInstanceType,
  msGraphScopes,
} from "../../../../use-cases/book-sources/one-drive";
import { MsGraphClientWrapperImpl } from "./ms-graph-client-wrapper-impl";
import { getMsGraphClient } from "./get-ms-graph-client";
import {
  MsGraphClientWrapper,
  MsGraphClientWrapperFactory,
} from "../../interfaces";
import { msalInstanceAccountToSourceId } from "../../util";
import { err, Result, ok } from "../../../../results";

@singleton()
@injectable()
export class MsGraphClientWrapperFactoryImpl
  implements MsGraphClientWrapperFactory
{
  getClientWrappers(
    msalInstance: MsalInstanceType
  ): Record<SourceIdStr, MsGraphClientWrapper> {
    const accounts = msalInstance.getAllAccounts();
    return Object.fromEntries(
      accounts.map((a) => [
        sourceIdToStr(msalInstanceAccountToSourceId(a)),
        this.getClientWrapperRaw(a, msalInstance),
      ])
    );
  }

  getClientWrapper(
    sourceId: SourceId,
    msalInstance: MsalInstanceType
  ): Result<MsGraphClientWrapper, SourceNotAvailableError> {
    const wrappers = this.getClientWrappers(msalInstance);

    const sidStr = sourceIdToStr(sourceId);
    if (!(sidStr in wrappers)) return err(sourceNotAvailableError(sourceId));
    return ok(wrappers[sidStr]);
  }

  private getClientWrapperRaw(
    account: AccountInfo,
    msalInstance: MsalInstanceType
  ): MsGraphClientWrapper {
    // Should I use cache?
    const pureClient = getMsGraphClient(account, msGraphScopes, msalInstance);
    return new MsGraphClientWrapperImpl(pureClient);
  }
}
