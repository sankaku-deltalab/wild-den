import { configureStore } from "@reduxjs/toolkit";
import bookDataSlice from "./slices/book-data-slice";

export const store = configureStore({
  reducer: {
    bookData: bookDataSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
