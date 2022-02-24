import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import {
  scanBooksThunk,
  syncBooksThunk,
} from "../../redux-state/slices/showcase-slice";
import { loginToOneDrive } from "../../src/use-cases-injection/book-sources/onedrive-use-cases-injection";
import { clearLocalRepository } from "../../src/use-cases-injection/common-use-cases-injection";

export type NavigationBarProps = {};

const NavigationBar: React.FC<NavigationBarProps> = (props) => {
  const dispatch = useAppDispatch();
  const { accounts, instance: msalInstance } = useMsal();

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
    // <Box sx={{ flexGrow: 1, width: "100%", padding: 0 }}>
    <AppBar
      position="sticky"
      sx={{ flexGrow: 1, width: "100%", padding: 0 }}
      enableColorOnDark
    >
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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Wild Den
        </Typography>
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
    // </Box>
  );
};

export default NavigationBar;
