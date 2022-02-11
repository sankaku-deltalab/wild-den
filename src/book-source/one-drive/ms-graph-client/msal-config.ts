import type { Configuration } from "@azure/msal-browser";

const clientId: string | undefined = process.env.NEXT_PUBLIC_MS_GRAPH_CLIENT_ID;
const redirectUri: string | undefined =
  process.env.NEXT_PUBLIC_MS_GRAPH_REDIRECT_URI;

if (!(clientId && redirectUri)) {
  throw Error("Wrong environment variables");
}

const authority = `https://login.microsoftonline.com/common`;

export const msalConfig: Configuration = {
  auth: {
    clientId, // This is the ONLY mandatory field that you need to supply.
    authority, // Defaults to "https://login.microsoftonline.com/common"
    redirectUri, // Points to window.location.origin. You must register this URI on Azure Portal/App Registration.
    postLogoutRedirectUri: redirectUri, // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};
