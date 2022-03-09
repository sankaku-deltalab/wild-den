import { configureStore } from "@reduxjs/toolkit";
import bookDataSlice from "./slices/book-data-slice";
import tagGroupsShowcaseSlice from "./slices/tag-groups-showcase-slice";
import taggedBooksShowcaseSlice from "./slices/tagged-books-showcase-slice";

export const store = configureStore({
  reducer: {
    bookData: bookDataSlice,
    tagGroupsShowcase: tagGroupsShowcaseSlice,
    taggedBooksShowcase: taggedBooksShowcaseSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
