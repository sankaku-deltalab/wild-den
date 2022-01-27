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
import { BookCacheRepositoryMock } from "../book-cache-repository-mock";
import { BookSourceMock } from "../book-source-mock";

const dateUtil = new DateUtilImpl();
const cache = new BookCacheRepositoryMock();
const getCachedBooks = new GetCachedBooks();
const loadBookBlob = new LoadBookBlob(dateUtil);
const scanBooksUC = new ScanBooks(dateUtil);

type ShowcaseState = {
  cache: BookCacheRepository;
  sources: Record<SourceId, BookSource>;
  bookProps: Record<BookIdStr, BookProps>;
  bookBlobs: Record<BookIdStr, BookFileBlob>;
  bookThumbnails: Record<BookIdStr, BookFileThumbnail>;
  status: "showing" | "blob loading" | "reading";
  scanStatus: "not scanning" | "scanning";
  readingBookId?: BookId;
};

const initialState: ShowcaseState = {
  cache,
  sources: { __mock_source__: new BookSourceMock() },
  bookProps: getCachedBooks.run(cache),
  bookBlobs: {},
  bookThumbnails: {},
  status: "showing",
  scanStatus: "not scanning",
  readingBookId: undefined,
};

export const showcaseSlice = createSlice({
  name: "showcase",
  initialState,
  reducers: {
    closeBook: (state) => {
      state.status = "showing";
      state.readingBookId = undefined;
    },
    addSource: (state, action: PayloadAction<BookSource>) => {
      state.sources[action.payload.getSourceId()] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBlob.pending, (state, action) => {
        state.status = "blob loading";
      })
      .addCase(loadBlob.fulfilled, (state, action) => {
        if (action.payload.err) {
          // TODO: show error
          state.status = "showing";
          return;
        }
        state.status = "reading";
        state.bookBlobs[bookIdToStr(action.payload.val.id)] =
          action.payload.val;
        state.readingBookId = action.payload.val.id;
      })
      .addCase(scanBooks.pending, (state, action) => {
        // TODO: show pending
        state.scanStatus = "scanning";
      })
      .addCase(scanBooks.fulfilled, (state, action) => {
        if (action.payload.err) {
          // TODO: show error
          state.scanStatus = "not scanning";
          return;
        }
        state.scanStatus = "not scanning";
        state.bookProps = action.payload.val;
      })
      .addCase(scanBooks.rejected, (state, action) => {
        console.log("failed");
        state.scanStatus = "not scanning";
      });
  },
});

export const loadBlob = createAsyncThunk<
  Result<BookFileBlob, "offline" | "not exists" | "source not found">,
  { id: BookId; sources: BookSource[]; cache: BookCacheRepository }
>("showcase/loadBlob", async ({ sources, cache, id }) => {
  return await loadBookBlob.run(sources, cache, id);
});

export const scanBooks = createAsyncThunk<
  Result<Record<BookIdStr, BookProps>, "offline">,
  { source: BookSource; cache: BookCacheRepository }
>("showcase/scanBooks", async ({ source, cache }) => {
  return await scanBooksUC.run(source, cache);
});

export const { closeBook, addSource } = showcaseSlice.actions;

export const selectReadingBook = (
  state: RootState
): Result<{ props: BookProps; blob: BookFileBlob }, "not reading"> => {
  const id = state.showcase.readingBookId;
  if (id === undefined || state.showcase.status !== "reading")
    return err("not reading");
  const idStr = bookIdToStr(id);
  return ok({
    props: state.showcase.bookProps[idStr],
    blob: state.showcase.bookBlobs[idStr],
  });
};

export default showcaseSlice.reducer;
