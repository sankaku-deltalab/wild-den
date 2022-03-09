import * as React from "react";
import { List } from "@mui/material";
import BookListItem from "./BookListItem";
import { BookPropsForShowcase } from "../../redux-state/slices/util/book-props-for-showcase";
import { BookIdStr } from "../../src/core";

export type BooksListProps = { books: [BookIdStr, BookPropsForShowcase][] };

const BooksList: React.FC<BooksListProps> = ({ books }) => {
  return (
    <List>
      {books.map(([idStr, props]) => (
        <BookListItem key={idStr} book={props} />
      ))}
    </List>
  );
};

export default BooksList;
