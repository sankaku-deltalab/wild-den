import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { Result, ok } from "../../src/results";
import {
  BookContentProps,
  BookId,
  bookIdToStr,
  BookProps,
  DataUri,
  LocalRepositoryConnectionError,
  OnlineBookAndSourceError,
} from "../../src/core";
import type { RootState } from "../store";
import { loadBookContent } from "../../src/use-cases-injection/common-use-cases-injection";

export type LoadingStateOfReader =
  | { type: "not-loading" }
  | { type: "loading"; elapsed: number; total: number }
  | { type: "loaded" }
  | { type: "failed" };

type BookReaderState = {
  readingBookId?: BookId;
  contentProps?: BookContentProps;
  contentData?: DataUri;
  contentLoadingProgress: LoadingStateOfReader;
};

const initialState: BookReaderState = {
  readingBookId: undefined,
  contentProps: undefined,
  contentData: undefined,
  contentLoadingProgress: { type: "loading", elapsed: 0, total: 1 },
};

export const bookReaderSlice = createSlice({
  name: "bookReader",
  initialState,
  reducers: {
    setBookIdOfReader: (state, action: PayloadAction<{ id?: BookId }>) => {
      state.readingBookId = action.payload.id;
      if (
        state.contentProps !== undefined &&
        !Object.is(state.readingBookId, state.contentProps.id)
      ) {
        state.contentProps = undefined;
        state.contentData = undefined;
      }
    },
    updateContentLoadingOfReader: (
      state,
      action: PayloadAction<{ id: BookId; elapsed: number; total: number }>
    ) => {
      const { id, elapsed, total } = action.payload;
      if (!Object.is(id, state.readingBookId)) {
        return;
      }
      state.contentLoadingProgress = {
        type: "loading",
        elapsed,
        total,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBookForReadThunk.pending, (state, action) => {
        state.contentLoadingProgress = { type: "not-loading" };
      })
      .addCase(loadBookForReadThunk.rejected, (state, action) => {
        state.contentLoadingProgress = { type: "failed" };
      })
      .addCase(loadBookForReadThunk.fulfilled, (state, action) => {
        if (action.payload.err) {
          state.contentLoadingProgress = { type: "failed" };
          return;
        }
        const { props, contentProps, contentData } = action.payload.val;
        state.contentProps = contentProps;
        state.contentData = contentData;
        state.contentLoadingProgress = { type: "loaded" };
      });
  },
});

export const loadBookForReadThunk = createAsyncThunk<
  Result<
    { props: BookProps; contentProps: BookContentProps; contentData: DataUri },
    OnlineBookAndSourceError | LocalRepositoryConnectionError
  >,
  { id: BookId },
  { state: RootState }
>("bookReader/loadBookForReadThunk", async ({ id }, thunkApi) => {
  const state = thunkApi.getState();
  const props = state.bookData.bookProps[bookIdToStr(id)];
  const loadedContent = await loadBookContent.run(id, (elapsed, total) => {
    thunkApi.dispatch(updateContentLoadingOfReader({ id, elapsed, total }));
  });
  if (loadedContent.err) return loadedContent;
  return ok({
    props,
    contentProps: loadedContent.val.props,
    contentData: loadedContent.val.data,
  });
});

export const { setBookIdOfReader, updateContentLoadingOfReader } =
  bookReaderSlice.actions;

export default bookReaderSlice.reducer;
