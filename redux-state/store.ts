import { configureStore } from "@reduxjs/toolkit";
import showcaseSlice from "./slices/showcase-slice";

export const store = configureStore({
  reducer: { showcase: showcaseSlice },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
