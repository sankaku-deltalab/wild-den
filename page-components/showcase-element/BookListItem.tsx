import * as React from "react";
import { useRouter } from "next/router";
import { ListItem, IconButton } from "@mui/material";
import {
  Download as DownloadIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "../../redux-state/hooks";
import { loadBookThunk } from "../../redux-state/slices/book-data-slice";
import { BookPropsForShowcase } from "../../redux-state/slices/util/book-props-for-showcase";
import { bookIdToBase64 } from "../../redux-state/slices/util/book-id-url-converter";

export type BookItemProps = { book: BookPropsForShowcase };

const BookListItem = ({ book }: BookItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const tags = book.tags;
  const tagsStr = tags.map((t) => `#${t}`).join(" ");

  return (
    <ListItem>
      <IconButton
        onClick={async () => {
          await dispatch(loadBookThunk({ id: book.id }));
          router.push(`/books/read/${bookIdToBase64(book.id)}`);
        }}
      >
        <BookIcon />
      </IconButton>
      <IconButton
        onClick={async () => {
          await dispatch(loadBookThunk({ id: book.id }));
        }}
      >
        <DownloadIcon />
      </IconButton>
      {`${book.title} [${tagsStr}]`}
    </ListItem>
  );
};

export default BookListItem;
