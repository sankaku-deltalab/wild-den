import { createSlice } from "@reduxjs/toolkit";
import { BookSource, DateUtilImpl, Result, ok, err } from "../../src";
import type { RootState } from "../store";
import { getMsGraphClient, msGraphScopes } from "../../src/book-source";
import {
  getOneDriveBookSource,
  oneDriveLoginIdGetter,
  msalInstance,
} from "./injection";

const dateUtil = new DateUtilImpl();

type OneDriveSourceState = {
  folderNameFilter: string[];
};

const initialState: OneDriveSourceState = {
  folderNameFilter: [".git", "music", "audio"],
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
  const client = getMsGraphClient(accounts[0], msGraphScopes, instance);
  const bookSource = getOneDriveBookSource.run(
    { ignoreFolderNames: ["."], scanFolderRoots: [] },
    client,
    oneDriveLoginIdGetter
  );
  return ok(bookSource);
};
