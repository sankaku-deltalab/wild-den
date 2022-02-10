// this code is based on: https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/AuthCodeMSALBrowserAuthenticationProvider.md
import {
  PublicClientApplication,
  InteractionType,
  AccountInfo,
} from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client/";
import {
  AuthCodeMSALBrowserAuthenticationProvider,
  AuthCodeMSALBrowserAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";

export const getMsGraphClient = (
  account: AccountInfo,
  scopes: string[],
  msalInstance: PublicClientApplication
) => {
  const options: AuthCodeMSALBrowserAuthenticationProviderOptions = {
    account: account,
    interactionType: InteractionType.Popup,
    scopes,
  };

  const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
    msalInstance,
    options
  );

  return Client.initWithMiddleware({
    authProvider,
  });
};
