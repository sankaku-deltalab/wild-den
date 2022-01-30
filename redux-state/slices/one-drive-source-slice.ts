import { createSlice } from "@reduxjs/toolkit";
import { BookSource, DateUtilImpl, Result, ok, err } from "../../src";
import type { RootState } from "../store";
import {
  getMsGraphClient,
  msGraphScopes,
  MsGraphClientWrapperImpl,
  OneDriveBookSource,
} from "../../src/book-source";
import { msalInstance } from "./injection";

const dateUtil = new DateUtilImpl();

type OneDriveSourceState = {
  ignoreFolderNames: string[];
};

const initialState: OneDriveSourceState = {
  ignoreFolderNames: [".git", "music", "audio"],
};

export const oneDriveSourceSlice = createSlice({
  name: "oneDriveSource",
  initialState,
  reducers: {},
});

// export const {} = oneDriveSourceSlice.actions;

export default oneDriveSourceSlice.reducer;

export const selectOneDriveMsalInstance = (state: RootState) => msalInstance;

export const selectOneDriveSource = (
  state: RootState
): Result<BookSource, "no account"> => {
  const instance = selectOneDriveMsalInstance(state);
  const accounts = instance.getAllAccounts();
  if (accounts.length === 0) return err("no account");
  const pureClient = getMsGraphClient(accounts[0], msGraphScopes, instance);
  const client = new MsGraphClientWrapperImpl(
    dateUtil,
    pureClient,
    state.oneDriveSource.ignoreFolderNames
  );
  return ok(new OneDriveBookSource(client));
};
