import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
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
  SourceId,
  Result,
  ok,
  err,
} from "../../src";
import type { RootState } from "../store";
import { selectBookSources, selectCache } from "./common-data-slice";
import {
  loadBookBlob,
  getCachedBooksUc,
  cache,
  scanBooksUC,
} from "./injection";

type ShowcaseState = {
  status: "showing" | "blob loading" | "reading" | "scanning";
  bookProps: Record<BookIdStr, BookProps>;
  blobLoadedBooks: Record<BookIdStr, true>;
  loadingBlobs: Record<BookIdStr, true>;
  readingBook?: {
    props: BookProps;
    blob: BookFileBlob;
  };
};

const initialState: ShowcaseState = {
  status: "showing",
  bookProps: getCachedBooksUc.run(cache),
  blobLoadedBooks: {},
  loadingBlobs: {},
  readingBook: undefined,
};

export const showcaseSlice = createSlice({
  name: "showcase",
  initialState,
  reducers: {
    closeBook: (state) => {
      state.status = "showing";
      state.readingBook = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(readBook.pending, (state, action) => {
        state.status = "blob loading";
      })
      .addCase(readBook.fulfilled, (state, action) => {
        if (action.payload.err) {
          // TODO: show error
          state.status = "showing";
          return;
        }
        state.status = "reading";
        state.blobLoadedBooks[bookIdToStr(action.meta.arg.id)] = true;
        state.readingBook = {
          props: action.payload.val.props,
          blob: action.payload.val.blob,
        };
      });
    builder
      .addCase(scanBooks.pending, (state, action) => {
        state.status = "scanning";
      })
      .addCase(scanBooks.fulfilled, (state, action) => {
        state.status = "showing";
        state.bookProps = action.payload;
      })
      .addCase(scanBooks.rejected, (state, action) => {
        state.status = "showing";
      });
  },
});

export const readBook = createAsyncThunk<
  Result<
    { props: BookProps; blob: BookFileBlob },
    "offline" | "not exists" | "source not found"
  >,
  { id: BookId },
  { state: RootState }
>("showcase/readBook", async ({ id }, thunkApi) => {
  const state = thunkApi.getState();
  const sources = selectBookSources(state);
  const cache = selectCache(state);
  const props = selectBookProps(state)[bookIdToStr(id)];
  const blob = await loadBookBlob.run(sources, cache, id);
  if (blob.err) return blob;
  return ok({
    props,
    blob: blob.val,
  });
});

export const scanBooks = createAsyncThunk<
  Record<BookIdStr, BookProps>,
  void,
  { state: RootState }
>("showcase/scanBooks", async (_, thunkApi) => {
  const state = thunkApi.getState();
  const sources = selectBookSources(state);
  const cache = selectCache(state);
  const r = await Promise.all(sources.map((s) => scanBooksUC.run(s, cache)));
  const r2: Record<BookIdStr, BookProps>[] = r.map((r) => (r.err ? {} : r.val));
  return Object.assign({}, ...r2);
});

export const { closeBook } = showcaseSlice.actions;

export const selectBookProps = (
  state: RootState
): Record<BookIdStr, BookProps> => {
  return state.showcase.bookProps;
};

export const selectReadingBook = (
  state: RootState
): Result<{ props: BookProps; blob: BookFileBlob }, "not reading"> => {
  const val = state.showcase.readingBook;
  if (val === undefined) return err("not reading");
  return ok(val);
};

export default showcaseSlice.reducer;
