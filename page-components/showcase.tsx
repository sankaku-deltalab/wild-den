import { useEffect } from "react";
import { List, ListItem, ListItemButton, Card } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  loadInitialBookPropsThunk,
  readBookThunk,
  selectSearchedBooks,
} from "../redux-state/slices/showcase-slice";
import NavigationBar from "./showcase-element/NavigationBar";
import BottomBar from "./showcase-element/BottomBar";
import { BookProps } from "../src/core";

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectSearchedBooks);

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
            <BookItem key={idStr} book={props} />
          ))}
        </List>
      </Card>
      <BottomBar />
    </>
  );
};

const BookItem = (props: { book: BookProps }) => {
  const dispatch = useAppDispatch();
  const { book } = props;

  const tags = [...book.autoTags.map((t) => t.name), ...book.manualTags];
  const tagsStr = tags.map((t) => `#${t}`).join(" ");

  return (
    <ListItem>
      <ListItemButton
        onClick={() => {
          dispatch(readBookThunk({ id: book.id }));
        }}
      >
        {`${book.title} [${tagsStr}]`}
      </ListItemButton>
    </ListItem>
  );
};

export default Showcase;
