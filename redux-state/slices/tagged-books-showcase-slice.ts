import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { selectSortedBookProps } from "./book-data-slice";
import { BookPropsForShowcase } from "./util/book-props-for-showcase";
import { BookIdStr } from "../../src/core";

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

export const selectVisibleTaggedBooks = createSelector(
  selectTagOfTaggedBooksShowcase,
  selectSortedBookProps,
  (tag, bookProps): [BookIdStr, BookPropsForShowcase][] => {
    return bookProps.filter(([key, p]) => p.tags.includes(tag));
  }
);

export default taggedBooksShowcaseSlice.reducer;
