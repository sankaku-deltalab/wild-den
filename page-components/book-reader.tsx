import { List, ListItem, ListItemButton, Button } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  closeBook,
  selectReadingBook,
} from "../redux-state/slices/showcase-slice";

const BookReader: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const readingBook = useAppSelector(selectReadingBook);

  return (
    <>
      <div>reading...</div>
      <div>{readingBook.toString()}</div>
      <Button onClick={() => dispatch(closeBook)}>Close</Button>
    </>
  );
};

export default BookReader;
