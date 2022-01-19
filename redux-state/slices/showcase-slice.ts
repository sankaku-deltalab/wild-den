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
} from "../../src";
import type { RootState } from "../store";
import { BookCacheRepositoryMock } from "../book-cache-repository-mock";
import { Err, Ok, Result } from "ts-results";

const dateUtil = new DateUtilImpl();
const cache = new BookCacheRepositoryMock();
const getCachedBooks = new GetCachedBooks();
const loadBookBlob = new LoadBookBlob(dateUtil);

type ShowcaseState = {
  cache: BookCacheRepository;
  sources: BookSource[];
  bookProps: Record<BookIdStr, BookProps>;
  bookBlobs: Record<BookIdStr, BookFileBlob>;
  bookThumbnails: Record<BookIdStr, BookFileThumbnail>;
  status: "showing" | "blob loading" | "reading";
  readingBookId?: BookId;
};

const initialState: ShowcaseState = {
  cache,
  sources: [],
  bookProps: getCachedBooks.run(cache),
  bookBlobs: {},
  bookThumbnails: {},
  status: "showing",
  readingBookId: undefined,
};

export const showcaseSlice = createSlice({
  name: "showcase",
  initialState,
  reducers: {},
  extraReducers(builder) {
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
        state.readingBookId = action.payload.val.id;
      });
  },
});

export const loadBlob = createAsyncThunk<
  Result<BookFileBlob, "offline" | "not exists" | "source not found">,
  { id: BookId; sources: BookSource[]; cache: BookCacheRepository }
>("showcase/loadBlob", async ({ sources, cache, id }) => {
  return await loadBookBlob.run(sources, cache, id);
});

export const selectReadingBook = (
  state: RootState
): Result<{ props: BookProps; blob: BookFileBlob }, "not reading"> => {
  const id = state.showcase.readingBookId;
  if (id === undefined) return new Err("not reading");
  const idStr = bookIdToStr(id);
  return new Ok({
    props: state.showcase.bookProps[idStr],
    blob: state.showcase.bookBlobs[idStr],
  });
};

export default showcaseSlice.reducer;
