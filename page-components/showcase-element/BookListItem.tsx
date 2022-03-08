import * as React from "react";
import { ListItem, ListItemButton } from "@mui/material";
import { useAppDispatch } from "../../redux-state/hooks";
import { readBookThunk } from "../../redux-state/slices/book-data-slice";
import { BookPropsForShowcase } from "../../redux-state/slices/util/book-props-for-showcase";

export type BookItemProps = { book: BookPropsForShowcase };

const BookListItem = ({ book }: BookItemProps) => {
  const dispatch = useAppDispatch();

  const tags = book.tags;
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

export default BookListItem;
