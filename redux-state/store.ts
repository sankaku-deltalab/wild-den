import { configureStore } from "@reduxjs/toolkit";
import commonDataSlice from "./slices/common-data-slice";
import oneDriveSourceSlice from "./slices/one-drive-source-slice";
import showcaseSlice from "./slices/showcase-slice";

export const store = configureStore({
  reducer: {
    commonData: commonDataSlice,
    showcase: showcaseSlice,
    oneDriveSource: oneDriveSourceSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
