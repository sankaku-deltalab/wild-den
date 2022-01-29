import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { Button, TextareaAutosize } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux-state/hooks";
import {
  selectOneDriveMsalInstance,
  selectOneDriveSource,
} from "../../redux-state/slices/one-drive-source-slice";
import { msGraphScopes } from "../../src/book-source";

const redirectLoginRequest = { scopes: msGraphScopes };

const IdTokenContent = () => {
  /**
   * useMsal is hook that returns the PublicClientApplication instance,
   * an array of all accounts currently signed in and an inProgress value
   * that tells you what msal is currently doing. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
   */
  const { accounts } = useMsal();
  const [idTokenClaims, setIdTokenClaims] = useState<Object | null>(null);

  function GetIdTokenClaims() {
    const claims = accounts[0].idTokenClaims;
    if (!claims) return;
    setIdTokenClaims(claims);
  }

  return (
    <>
      <h5 className="card-title">Welcome {accounts[0].name}</h5>
      {idTokenClaims ? (
        <TextareaAutosize
          value={JSON.stringify(idTokenClaims, null, 4)}
        ></TextareaAutosize>
      ) : (
        <Button onClick={GetIdTokenClaims}>View ID Token Claims</Button>
      )}
    </>
  );
};

const Content = () => {
  const dispatch = useAppDispatch();
  const msalInstance = useAppSelector(selectOneDriveMsalInstance);
  const oneDriveSource = useAppSelector(selectOneDriveSource);
  const [clientRequestCommand, setClientRequestCommand] = useState("");
  const [clientResponse, setClientResponse] = useState({});

  const handleCommand = async (
    command: string,
    type: "get" | "post"
  ): Promise<void> => {
    // console.log(`run: ${command}`);
    // const client = clientWrapperResult.ok ? clientWrapperResult.val : undefined;
    // if (!client) {
    //   console.log(`no client`);
    //   return;
    // }
    // if (type === "get") {
    //   const r = await client.getBookFiles("one-drive-test");
    //   console.log(r);
    //   setClientResponse(r);
    // }
  };

  const handleAddSource = async (): Promise<void> => {};

  return (
    <MsalProvider instance={msalInstance}>
      <Link href={"/"}>Back to Showcase</Link>
      <UnauthenticatedTemplate>
        <h5 className="card-title">
          Please sign-in to see your profile information.
        </h5>
        <Button
          onClick={() => msalInstance.loginRedirect(redirectLoginRequest)}
        >
          Login with redirect
        </Button>
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <IdTokenContent />

        <Button onClick={handleAddSource}>Add OneDrive source</Button>
        <div>
          <Button onClick={() => msalInstance.logoutRedirect()}>
            Logout with redirect
          </Button>
          <TextareaAutosize
            value={clientRequestCommand}
            onChange={(e) => setClientRequestCommand(e.target.value)}
          ></TextareaAutosize>
          <Button onClick={() => handleCommand(clientRequestCommand, "get")}>
            Apply
          </Button>
        </div>
        <div>
          <TextareaAutosize
            value={JSON.stringify(clientResponse, null, 4)}
          ></TextareaAutosize>
        </div>
      </AuthenticatedTemplate>
    </MsalProvider>
  );
};

const OneDriveSource: NextPage = () => {
  const msalInstance = useAppSelector(selectOneDriveMsalInstance);

  return (
    <MsalProvider instance={msalInstance}>
      <Head>
        <title>Wild Den</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Content></Content>
      </main>
    </MsalProvider>
  );
};

export default OneDriveSource;
