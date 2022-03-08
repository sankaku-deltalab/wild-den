import { configureStore } from "@reduxjs/toolkit";
import bookDataSlice from "./slices/book-data-slice";
import mainShowcaseSlice from "./slices/main-showcase-slice";

export const store = configureStore({
  reducer: {
    bookData: bookDataSlice,
    mainShowcase: mainShowcaseSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
