import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  calcTagGroups,
  TagGroupForShowcase,
} from "./util/tag-group-for-showcase";
import { selectBookPropsForShowcase } from "./book-data-slice";
import { searchTagGroups } from "./util/tag-searching";

type TagGroupsShowcaseState = {
  tagSearchText: string;
};

const initialState: TagGroupsShowcaseState = {
  tagSearchText: "",
};

export const tagGroupsShowcaseSlice = createSlice({
  name: "tagGroupsShowcase",
  initialState,
  reducers: {
    updateTagSearchText: (state, action: PayloadAction<{ text: string }>) => {
      state.tagSearchText = action.payload.text;
    },
  },
});

export const { updateTagSearchText } = tagGroupsShowcaseSlice.actions;

export const selectTagSearchText = (state: RootState) =>
  state.tagGroupsShowcase.tagSearchText;

const selectRawTagGroups = createSelector(
  selectBookPropsForShowcase,
  (bookProps): Record<string, TagGroupForShowcase> => {
    return calcTagGroups(bookProps);
  }
);

const selectSortedRawTagGroups = createSelector(
  selectRawTagGroups,
  (tagGroups): TagGroupForShowcase[] => {
    return Object.values(tagGroups).sort((gA, gB) =>
      gA.name.localeCompare(gB.name)
    );
  }
);

export const selectVisibleTagGroups = createSelector(
  selectTagSearchText,
  selectSortedRawTagGroups,
  (searchText, tagGroups): TagGroupForShowcase[] => {
    return searchTagGroups(searchText, tagGroups);
  }
);

export default tagGroupsShowcaseSlice.reducer;
