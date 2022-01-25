import { configureStore } from "@reduxjs/toolkit";
import oneDriveSourceSlice from "./slices/one-drive-source-slice";
import showcaseSlice from "./slices/showcase-slice";

export const store = configureStore({
  reducer: {
    showcase: showcaseSlice,
    oneDriveSourceSlice: oneDriveSourceSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
