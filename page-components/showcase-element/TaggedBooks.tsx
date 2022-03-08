import * as React from "react";
import { Grid, List, ListItem, ListItemButton } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import {
  readBookThunk,
  selectSearchedBooks,
  selectSortedTagGroups,
} from "../../redux-state/slices/showcase-slice";
import TagGroupContent from "./TagGroupContent";
import { BookPropsForShowcase } from "../../redux-state/slices/util/book-props-for-showcase";
import BookListItem from "./BookListItem";

export type TaggedBooksProps = {};

const TaggedBooks: React.FC<TaggedBooksProps> = (props) => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectSearchedBooks);

  return (
    <List>
      {books.map(([idStr, props]) => (
        <BookListItem key={idStr} book={props} />
      ))}
    </List>
  );
};

export default TaggedBooks;
