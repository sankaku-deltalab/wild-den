// this code is based on: https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/AuthCodeMSALBrowserAuthenticationProvider.md
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msal-config";

export const getMsalInstance = () => {
  return new PublicClientApplication(msalConfig);
};
