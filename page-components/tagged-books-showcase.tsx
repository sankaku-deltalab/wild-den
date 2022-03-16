import { useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  selectSearchedTaggedBooks,
  setTagOfTaggedBooksShowcase,
} from "../redux-state/slices/tagged-books-showcase-slice";
import NavigationBar from "./showcase-element/NavigationBar";
import BottomBar from "./showcase-element/BottomBar";
import BooksList from "./showcase-element/BooksList";

const TaggedBooksShowcase: React.FC<{}> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectSearchedTaggedBooks);

  const { tag } = router.query;

  useEffect(() => {
    dispatch(setTagOfTaggedBooksShowcase({ tag: tag as string }));
  }, [dispatch, tag]);

  return (
    <>
      <NavigationBar />
      <Card sx={{ width: "100%" }}>
        <BooksList books={books}></BooksList>
      </Card>
      <BottomBar />
    </>
  );
};

export default TaggedBooksShowcase;
