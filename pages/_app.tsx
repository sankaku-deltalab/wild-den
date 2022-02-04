import "isomorphic-fetch"; // used for `@microsoft/microsoft-graph-client` see: https://www.npmjs.com/package/@microsoft/microsoft-graph-client
import "reflect-metadata";
import "../styles/globals.css";
import type { PropsWithChildren } from "react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { MsalProvider } from "@azure/msal-react";
import { store } from "../redux-state";
import { useAppSelector } from "../redux-state/hooks";
import { selectOneDriveMsalInstance } from "../redux-state/slices/one-drive-source-slice";

const MyAppInternal = ({ children }: PropsWithChildren<{}>) => {
  const msalInstance = useAppSelector(selectOneDriveMsalInstance);
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <MyAppInternal>
        <Component {...pageProps} />
      </MyAppInternal>
    </Provider>
  );
}

export default MyApp;
