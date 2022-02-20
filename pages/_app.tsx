import "isomorphic-fetch"; // used for `@microsoft/microsoft-graph-client` see: https://www.npmjs.com/package/@microsoft/microsoft-graph-client
import "reflect-metadata";
import "../src/injection";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { MsalProvider } from "@azure/msal-react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { store } from "../redux-state";
import "../src/use-cases-injection/common-use-cases-injection";
import "../src/use-cases-injection/book-sources/onedrive-use-cases-injection";
import { getMsalInstance } from "../src/use-cases-injection/book-sources/onedrive-use-cases-injection";

const msalInstance = getMsalInstance.run();

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <Provider store={store}>
        <ThemeProvider theme={darkTheme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </MsalProvider>
  );
}

export default MyApp;
