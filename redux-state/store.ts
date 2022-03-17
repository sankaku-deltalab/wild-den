import { configureStore } from "@reduxjs/toolkit";
import bookDataSlice from "./slices/book-data-slice";
import bookReaderSlice from "./slices/book-reader-slice";
import showcaseSearchInputSlice from "./slices/showcase-search-input-slice";
import tagGroupsShowcaseSlice from "./slices/tag-groups-showcase-slice";
import taggedBooksShowcaseSlice from "./slices/tagged-books-showcase-slice";

export const store = configureStore({
  reducer: {
    bookData: bookDataSlice,
    showcaseSearchInput: showcaseSearchInputSlice,
    tagGroupsShowcase: tagGroupsShowcaseSlice,
    taggedBooksShowcase: taggedBooksShowcaseSlice,
    bookReader: bookReaderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
