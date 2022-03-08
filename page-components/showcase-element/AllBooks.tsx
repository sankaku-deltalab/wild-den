import * as React from "react";
import { List } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import { selectSearchedBooks } from "../../redux-state/slices/showcase-slice";
import BookListItem from "./BookListItem";

export type AllBooksProps = {};

const AllBooks: React.FC<AllBooksProps> = (props) => {
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

export default AllBooks;
