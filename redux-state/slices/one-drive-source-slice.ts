import { Err, Ok, Result } from "ts-results";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { PublicClientApplication } from "@azure/msal-browser";
import {
  BookFileBlob,
  BookFileThumbnail,
  BookIdStr,
  BookProps,
  BookSource,
  BookCacheRepository,
  GetCachedBooks,
  LoadBookBlob,
  DateUtilImpl,
  BookId,
  bookIdToStr,
  ScanBooks,
} from "../../src";
import type { RootState } from "../store";
import { BookCacheRepositoryMock } from "../book-cache-repository-mock";
import { BookSourceMock } from "../book-source-mock";
import { msalConfig } from "./one-drive-source-info";

// auth
// https://www.npmjs.com/package/@azure/msal-browser
// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/request.md
// client
// https://www.npmjs.com/package/@microsoft/microsoft-graph-client
// AppFolder must be used
// https://docs.microsoft.com/ja-jp/onedrive/developer/rest-api/concepts/permissions_reference?view=odsp-graph-online

// const dateUtil = new DateUtilImpl();
// const cache = new BookCacheRepositoryMock();
// const getCachedBooks = new GetCachedBooks();
// const loadBookBlob = new LoadBookBlob(dateUtil);
// const scanBooksUC = new ScanBooks(dateUtil);

type OneDriveSourceState = {
  pca: PublicClientApplication;
};

const initialState: OneDriveSourceState = {
  pca: new PublicClientApplication(msalConfig),
};

export const oneDriveSourceSlice = createSlice({
  name: "oneDriveSource",
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});

export const {} = oneDriveSourceSlice.actions;

export default oneDriveSourceSlice.reducer;

export const selectOneDrivePca = (state: RootState) =>
  state.oneDriveSourceSlice.pca;
