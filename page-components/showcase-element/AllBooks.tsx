import * as React from "react";
import { List } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import { selectSortedBookProps } from "../../redux-state/slices/book-data-slice";
import BookListItem from "./BookListItem";

export type AllBooksProps = {};

const AllBooks: React.FC<AllBooksProps> = (props) => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectSortedBookProps);

  return (
    <List>
      {books.map(([idStr, props]) => (
        <BookListItem key={idStr} book={props} />
      ))}
    </List>
  );
};

export default AllBooks;
