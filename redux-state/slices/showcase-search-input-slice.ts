import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type ShowcaseSearchInputState = {
  searchText: string;
};

const initialState: ShowcaseSearchInputState = {
  searchText: "",
};

export const showcaseSearchInputState = createSlice({
  name: "showcaseSearchInputState",
  initialState,
  reducers: {
    updateSearchText: (
      state,
      action: PayloadAction<{ searchText: string }>
    ) => {
      state.searchText = action.payload.searchText;
    },
  },
});

export const { updateSearchText } = showcaseSearchInputState.actions;

export const selectSearchText = (state: RootState) =>
  state.showcaseSearchInput.searchText;

export default showcaseSearchInputState.reducer;
