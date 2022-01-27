import { Button } from "@mui/material";
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
      <div>{JSON.stringify(readingBook, null, 4)}</div>
      <Button onClick={() => dispatch(closeBook())}>Close</Button>
    </>
  );
};

export default BookReader;
