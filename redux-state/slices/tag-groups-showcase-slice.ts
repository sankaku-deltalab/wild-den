import { createSlice, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  calcTagGroups,
  TagGroupForShowcase,
} from "./util/tag-group-for-showcase";
import { selectBookPropsForShowcase } from "./book-data-slice";
import { searchTagGroups } from "./util/tag-searching";
import { selectSearchText } from "./showcase-search-input-slice";

type TagGroupsShowcaseState = {};

const initialState: TagGroupsShowcaseState = {};

export const tagGroupsShowcaseSlice = createSlice({
  name: "tagGroupsShowcase",
  initialState,
  reducers: {},
});

export const {} = tagGroupsShowcaseSlice.actions;

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
  selectSearchText,
  selectSortedRawTagGroups,
  (searchText, tagGroups): TagGroupForShowcase[] => {
    return searchTagGroups(searchText, tagGroups);
  }
);

export default tagGroupsShowcaseSlice.reducer;
