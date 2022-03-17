import * as React from "react";
import { useRouter } from "next/router";
import { ListItem, IconButton, Divider } from "@mui/material";
import {
  Download as DownloadIcon,
  DownloadDone as DownloadDoneIcon,
  PlayArrow as PlayIcon,
  FiberNew as NewIcon,
  Pause as PauseIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../redux-state/hooks";
import { loadBookThunk } from "../../redux-state/slices/book-data-slice";
import { BookPropsForShowcase } from "../../redux-state/slices/util/book-props-for-showcase";
import { bookIdToBase64 } from "../../redux-state/slices/util/book-id-url-converter";
import { BookContentProps, bookIdToStr, ReadingState } from "../../src/core";

export type BookItemProps = { book: BookPropsForShowcase };

const BookListItem = ({ book }: BookItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const availableContentProps = useAppSelector(
    (s) => s.bookData.bookContentProps
  );

  const contentProps: BookContentProps | undefined =
    availableContentProps[bookIdToStr(book.id)];
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
        <PlayIcon />
      </IconButton>
      <Divider orientation="vertical" />
      <IconButton
        onClick={() => {
          // TODO: change state
        }}
      >
        <ReadingStateIcon state={book.readingState} />
      </IconButton>
      <IconButton
        disabled={contentProps !== undefined}
        onClick={async () => {
          await dispatch(loadBookThunk({ id: book.id }));
        }}
      >
        {contentProps !== undefined ? (
          <DownloadDoneIcon fontSize="small" />
        ) : (
          <DownloadIcon fontSize="small" />
        )}
      </IconButton>
      {`${book.title} [${tagsStr}]`}
    </ListItem>
  );
};

const ReadingStateIcon: React.FC<{ state: ReadingState }> = ({ state }) => {
  const icons = {
    new: <NewIcon fontSize="small" />,
    reading: <PlayIcon fontSize="small" />,
    anytime: <PauseIcon fontSize="small" />,
    completed: <DoneIcon fontSize="small" />,
  };
  return icons[state];
};

export default BookListItem;
