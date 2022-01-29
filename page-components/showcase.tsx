import { List, ListItem, ListItemButton, Button } from "@mui/material";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import { scanBooks, readBook } from "../redux-state/slices/showcase-slice";
import { msGraphScopes } from "../src";

const redirectLoginRequest = { scopes: msGraphScopes };

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.showcase.bookProps);
  const { accounts, instance: msalInstance } = useMsal();

  return (
    <>
      <div>
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
          <div>{JSON.stringify(accounts)}</div>

          <div>
            <Button onClick={() => msalInstance.logoutRedirect()}>
              Logout with redirect
            </Button>
          </div>
        </AuthenticatedTemplate>
      </div>
      books
      <Button onClick={() => dispatch(scanBooks())}>Scan</Button>
      <List>
        {Object.entries(books).map(([idStr, props]) => (
          <ListItem key={idStr}>
            <ListItemButton
              onClick={() => {
                dispatch(readBook({ id: props.id }));
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
