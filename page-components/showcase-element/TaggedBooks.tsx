import * as React from "react";
import { List } from "@mui/material";
import { useAppSelector } from "../../redux-state/hooks";
import { selectSearchedTaggedBooks } from "../../redux-state/slices/tagged-books-showcase-slice";
import BookListItem from "./BookListItem";

export type TaggedBooksProps = {};

const TaggedBooks: React.FC<TaggedBooksProps> = (props) => {
  const books = useAppSelector(selectSearchedTaggedBooks);

  return (
    <List>
      {books.map(([idStr, props]) => (
        <BookListItem key={idStr} book={props} />
      ))}
    </List>
  );
};

export default TaggedBooks;
