import { AccountInfo } from "@azure/msal-browser";
import { SourceId } from "../../../core";
import type { MsGraphClientWrapper } from "../interface-adapter/types";
import { MsGraphClientWrapperFactory } from "../interface-adapter/one-drive-book-source-factory-raw-impl";
import { MsalInstanceType } from "../../../use-cases/book-sources/one-drive";
import { MsGraphClientWrapperImpl } from "./ms-graph-client-wrapper-impl";
import { getMsGraphClient } from "./get-ms-graph-client";

const msGraphScopes = ["Files.Read.All", "Files.ReadWrite.AppFolder"];

export class MsGraphClientWrapperFactoryImpl
  implements MsGraphClientWrapperFactory
{
  getClientWrappers(
    msalInstance: MsalInstanceType
  ): Record<SourceId, MsGraphClientWrapper> {
    const accounts = msalInstance.getAllAccounts();
    return Object.fromEntries(
      accounts.map((a) => [
        a.homeAccountId,
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
