import { useState } from "react";
import { List, ListItem, ListItemButton, Button, Input } from "@mui/material";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  scanBooksThunk,
  readBookThunk,
} from "../redux-state/slices/showcase-slice";
import { loginToOneDrive } from "../src/use-cases-injection/book-sources/onedrive-use-cases-injection";

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.showcase.bookProps);
  const { accounts, instance: msalInstance } = useMsal();
  const [testStr, setTestStr] = useState("not set");

  return (
    <>
      <div>
        <Input
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
        ></Input>
        <UnauthenticatedTemplate>
          <h5 className="card-title">
            Please sign-in to see your profile information.
          </h5>
          {/* TODO: Login with slice */}
          <Button onClick={() => loginToOneDrive.run()}>Login</Button>
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <div>{JSON.stringify(accounts)}</div>

          <div>
            <Button onClick={() => msalInstance.logoutRedirect()}>
              Logout with redirect
            </Button>
          </div>
        </AuthenticatedTemplate>
      </div>
      books
      <Button onClick={() => dispatch(scanBooksThunk())}>Scan</Button>
      <List>
        {Object.entries(books).map(([idStr, props]) => (
          <ListItem key={idStr}>
            <ListItemButton
              onClick={() => {
                dispatch(readBookThunk({ id: props.id }));
              }}
            >
              {props.title}
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem></ListItem>
      </List>
    </>
  );
};

export default Showcase;
