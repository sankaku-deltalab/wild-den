import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { selectSortedBookProps } from "./book-data-slice";
import { searchBooks } from "./util/book-searching";
import { BookPropsForShowcase } from "./util/book-props-for-showcase";
import { BookIdStr, bookIdToStr } from "../../src/core";
import { selectSearchText } from "./showcase-search-input-slice";

type TaggedBooksShowcaseState = {
  chosenTag?: string;
};

const initialState: TaggedBooksShowcaseState = {
  chosenTag: undefined,
};

export const taggedBooksShowcaseSlice = createSlice({
  name: "taggedBooksShowcase",
  initialState,
  reducers: {
    setTagOfTaggedBooksShowcase: (
      state,
      action: PayloadAction<{ tag?: string }>
    ) => {
      state.chosenTag = action.payload.tag;
    },
  },
});

export const { setTagOfTaggedBooksShowcase } = taggedBooksShowcaseSlice.actions;

export const selectTagOfTaggedBooksShowcase = (state: RootState) =>
  state.taggedBooksShowcase.chosenTag ?? "";

const selectVisibleTaggedBooks = createSelector(
  selectTagOfTaggedBooksShowcase,
  selectSortedBookProps,
  (tag, bookProps): [BookIdStr, BookPropsForShowcase][] => {
    return bookProps.filter(([key, p]) => p.tags.includes(tag));
  }
);

export const selectSearchedTaggedBooks = createSelector(
  selectSearchText,
  selectVisibleTaggedBooks,
  (searchText, bookProps): [BookIdStr, BookPropsForShowcase][] => {
    if (searchText === "") return bookProps;
    const books = searchBooks(
      searchText,
      bookProps.map(([k, p]) => p)
    );
    return books.map((p) => [bookIdToStr(p.id), p]);
  }
);

export default taggedBooksShowcaseSlice.reducer;
