import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { PublicClientApplication } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
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
  Result,
  ok,
  err,
} from "../../src";
import type { RootState } from "../store";
import { BookCacheRepositoryMock } from "../book-cache-repository-mock";
import { BookSourceMock } from "../book-source-mock";
import {
  getMsGraphClient,
  getMsalInstance,
  msGraphScopes,
  MsGraphClientWrapper,
  MsGraphClientWrapperImpl,
  OneDriveBookSource,
} from "../../src/book-source";

const dateUtil = new DateUtilImpl();

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
  msalInstance: PublicClientApplication;
};

const initialState: OneDriveSourceState = {
  msalInstance: getMsalInstance(),
};

export const oneDriveSourceSlice = createSlice({
  name: "oneDriveSource",
  initialState,
  reducers: {},
  // extraReducers: (builder) => {},
});

// export const {} = oneDriveSourceSlice.actions;

export default oneDriveSourceSlice.reducer;

export const selectOneDriveMsalInstance = (state: RootState) =>
  state.oneDriveSourceSlice.msalInstance;

export const selectOneDriveClient = (
  state: RootState
): Result<Client, "no account"> => {
  const instance = state.oneDriveSourceSlice.msalInstance;
  const accounts = instance.getAllAccounts();
  if (accounts.length === 0) return err("no account");
  return ok(getMsGraphClient(accounts[0], msGraphScopes, instance));
};

export const selectOneDriveClientWrapper = (
  state: RootState
): Result<MsGraphClientWrapper, "no account"> => {
  const pureClient = selectOneDriveClient(state);
  if (pureClient.err) return pureClient;
  return ok(new MsGraphClientWrapperImpl(dateUtil, pureClient.val));
};

export const selectOneDriveSource = (
  state: RootState
): Result<BookSource, "no account"> => {
  const client = selectOneDriveClientWrapper(state);
  if (client.err) return client;
  return ok(new OneDriveBookSource(client.val));
};
