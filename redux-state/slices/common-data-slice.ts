import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  BookFileBlob,
  BookIdStr,
  BookProps,
  BookSource,
  BookCacheRepository,
  BookId,
  Result,
  bookIdToStr,
} from "../../src";
import type { RootState } from "../store";
import {
  cache,
  getCachedBooksUc,
  loadBookBlob,
  scanBooksUC,
} from "./injection";
import { selectOneDriveSource } from "./one-drive-source-slice";

type CommonDataState = {};

const initialState: CommonDataState = {};

export const commonDataSlice = createSlice({
  name: "commonData",
  initialState,
  reducers: {},

  extraReducers: (builder) => {},
});

export const selectBookSources = (state: RootState): BookSource[] => {
  const oneDriveSource = selectOneDriveSource(state);
  return [...(oneDriveSource.ok ? [oneDriveSource.val] : [])];
};

export const selectCache = (state: RootState): BookCacheRepository => {
  return cache;
};

export default commonDataSlice.reducer;
