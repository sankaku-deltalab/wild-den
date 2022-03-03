import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import {
  scanBooksThunk,
  selectSearchText,
  syncBooksThunk,
  updateSearchText,
} from "../../redux-state/slices/showcase-slice";
import { loginToOneDrive } from "../../src/use-cases-injection/book-sources/onedrive-use-cases-injection";
import { clearLocalRepository } from "../../src/use-cases-injection/common-use-cases-injection";
import { Box, TextField, InputAdornment } from "@mui/material";

export type NavigationBarProps = {};

const NavigationBar: React.FC<NavigationBarProps> = (props) => {
  const dispatch = useAppDispatch();
  const { accounts, instance: msalInstance } = useMsal();

  const searchText = useAppSelector(selectSearchText);

  const handleUpdateSearchText = (text: string) => {
    dispatch(updateSearchText({ text }));
  };

  // TODO: use slice dispatcher
  const elementNotLoggedIn = (
    <UnauthenticatedTemplate>
      <Button
        color="inherit"
        variant="text"
        onClick={() => loginToOneDrive.run(window.location.href)}
      >
        Login
      </Button>
    </UnauthenticatedTemplate>
  );
  const elementLoggedIn = (
    <AuthenticatedTemplate>
      <Button
        color="inherit"
        variant="text"
        onClick={() => msalInstance.logoutRedirect()}
      >
        Logout
      </Button>
    </AuthenticatedTemplate>
  );
  return (
    <Box sx={{ flexGrow: 1, width: "100%", padding: 0 }}>
      <AppBar position="sticky" enableColorOnDark>
        <Toolbar sx={{ padding: 0 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <TextField
            sx={{ flexGrow: 1 }}
            placeholder={"Search"}
            value={searchText}
            variant="standard"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleUpdateSearchText("")}
                    disabled={searchText.length === 0}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              handleUpdateSearchText(e.target.value);
            }}
          />
          {elementNotLoggedIn} {elementLoggedIn}
          <Button
            color="inherit"
            variant="text"
            onClick={() => clearLocalRepository.run()}
          >
            Clear Local
          </Button>
          <Button
            color="inherit"
            variant="text"
            onClick={() => dispatch(scanBooksThunk())}
          >
            Scan
          </Button>
          <Button
            color="inherit"
            variant="text"
            onClick={() => dispatch(syncBooksThunk())}
          >
            Sync
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavigationBar;
