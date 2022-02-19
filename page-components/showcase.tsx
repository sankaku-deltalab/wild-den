import { useEffect } from "react";
import { List, ListItem, ListItemButton, Button } from "@mui/material";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  loadInitialBookPropsThunk,
  scanBooksThunk,
  readBookThunk,
} from "../redux-state/slices/showcase-slice";
import { loginToOneDrive } from "../src/use-cases-injection/book-sources/onedrive-use-cases-injection";

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.showcase.bookProps);
  const loadingState = useAppSelector(
    (state) => state.showcase.contentLoadState
  );
  const { accounts, instance: msalInstance } = useMsal();

  // run only first time
  useEffect(() => {
    const f = async () => {
      dispatch(loadInitialBookPropsThunk({}));
    };
    f();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>
        <UnauthenticatedTemplate>
          <h5 className="card-title">
            Please sign-in to see your profile information.
          </h5>
          {/* TODO: Login with slice */}
          <Button onClick={() => loginToOneDrive.run(window.location.href)}>
            Login
          </Button>
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <div>{`OneDrive Accounts: ${JSON.stringify(
            accounts.map((a) => a.name)
          )}`}</div>

          <div>
            <Button onClick={() => msalInstance.logoutRedirect()}>
              Logout with redirect
            </Button>
          </div>
        </AuthenticatedTemplate>
      </div>
      {[...Object.keys(loadingState)].length === 0 ? undefined : (
        <div>
          loading
          <List>
            {Object.entries(loadingState).map(([idStr, { elapsed, total }]) => (
              <ListItem key={idStr}>
                <div>
                  {books[idStr].title}: {Math.floor((elapsed / total) * 100)}%
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      )}
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
      </List>
    </>
  );
};

export default Showcase;
