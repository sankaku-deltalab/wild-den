import { Configuration } from "@azure/msal-browser";

const clientId = "be4b9fc3-f0eb-4126-abd7-0377e8e3b216";
const authority =
  "https://login.microsoftonline.com/172f6cdd-ac32-4a65-a6a0-cd2a88acf58f";
const redirectUri = "http://localhost:3000/";
const postLogoutRedirectUri = "http://localhost:3000/";

export const msalConfig: Configuration = {
  auth: {
    clientId, // This is the ONLY mandatory field that you need to supply.
    authority, // Defaults to "https://login.microsoftonline.com/common"
    redirectUri, // Points to window.location.origin. You must register this URI on Azure Portal/App Registration.
    postLogoutRedirectUri, // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};
