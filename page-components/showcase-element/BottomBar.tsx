import * as React from "react";
import { AppBar, Toolbar, List, ListItem } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";

export type BottomBarProps = {};

const BottomBar: React.FC<BottomBarProps> = (props) => {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.showcase.bookProps);
  const loadingState = useAppSelector(
    (state) => state.showcase.contentLoadState
  );

  const isLoading = [...Object.keys(loadingState)].length > 0;
  if (!isLoading) return <></>;

  return (
    <>
      <AppBar
        position="fixed"
        enableColorOnDark
        sx={{ flexGrow: 1, width: "100vw", top: "auto", bottom: 0 }}
      >
        <Toolbar>
          Loading:
          <List>
            {Object.entries(loadingState).map(([idStr, { elapsed, total }]) => (
              <ListItem key={idStr}>
                <div>
                  {books[idStr].title}: {Math.floor((elapsed / total) * 100)}%
                </div>
              </ListItem>
            ))}
          </List>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default BottomBar;
