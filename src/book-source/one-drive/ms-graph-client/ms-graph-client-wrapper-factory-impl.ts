import { AccountInfo } from "@azure/msal-browser";
import { SourceIdStr, sourceIdToStr } from "../../../core";
import { MsalInstanceType } from "../../../use-cases/book-sources/one-drive";
import { MsGraphClientWrapperImpl } from "./ms-graph-client-wrapper-impl";
import { getMsGraphClient } from "./get-ms-graph-client";
import {
  MsGraphClientWrapper,
  MsGraphClientWrapperFactory,
} from "../interfaces";
import { msalInstanceAccountToSourceId } from "../util";

const msGraphScopes = ["Files.Read.All", "Files.ReadWrite.AppFolder"];

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
        this.getClientWrapper(a, msalInstance),
      ])
    );
  }

  private getClientWrapper(
    account: AccountInfo,
    msalInstance: MsalInstanceType
  ): MsGraphClientWrapper {
    // Should I use cache?
    const pureClient = getMsGraphClient(account, msGraphScopes, msalInstance);
    return new MsGraphClientWrapperImpl(pureClient);
  }
}
