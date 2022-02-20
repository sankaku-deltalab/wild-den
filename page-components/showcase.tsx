import { useEffect } from "react";
import { List, ListItem, ListItemButton, Button, Card } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  loadInitialBookPropsThunk,
  readBookThunk,
  selectSortedBookProps,
} from "../redux-state/slices/showcase-slice";
import NavigationBar from "./showcase-element/NavigationBar";
import BottomBar from "./showcase-element/BottomBar";

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectSortedBookProps);

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
      <NavigationBar />
      <Card sx={{ width: "100%" }}>
        <List>
          {books.map(([idStr, props]) => (
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
      </Card>
      <BottomBar />
    </>
  );
};

export default Showcase;
