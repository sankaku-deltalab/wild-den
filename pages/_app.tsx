import "isomorphic-fetch"; // used for `@microsoft/microsoft-graph-client` see: https://www.npmjs.com/package/@microsoft/microsoft-graph-client
import "reflect-metadata";
import "../src/injection";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { MsalProvider } from "@azure/msal-react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { store, useAppDispatch, useAppSelector } from "../redux-state";
import "../src/use-cases-injection/common-use-cases-injection";
import "../src/use-cases-injection/book-sources/onedrive-use-cases-injection";
import { getMsalInstance } from "../src/use-cases-injection/book-sources/onedrive-use-cases-injection";
import { CssBaseline } from "@mui/material";
import {
  loadInitialBookPropsThunk,
  selectInitializeStatus,
} from "../redux-state/slices/book-data-slice";

const msalInstance = getMsalInstance.run();

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    // background: { default: "#1976d2" },
    background: {
      default: "#101010",
    },
  },
});

const MyAppInternal: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const dispatch = useAppDispatch();
  const initStatus = useAppSelector(selectInitializeStatus);

  useEffect(() => {
    const f = async () => {
      if (initStatus !== "not-yet") return;
      dispatch(loadInitialBookPropsThunk({}));
    };
    f();
  }, [dispatch, initStatus]);

  return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <Provider store={store}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <MyAppInternal>
            <Component {...pageProps} />
          </MyAppInternal>
        </ThemeProvider>
      </Provider>
    </MsalProvider>
  );
}

export default MyApp;
