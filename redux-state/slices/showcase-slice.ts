import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Result, ok, err } from "../../src/results";
import {
  BookContentProps,
  BookId,
  BookIdStr,
  bookIdToStr,
  BookProps,
  BookRecord,
  DataUri,
  LocalRepositoryConnectionError,
  OnlineBookAndSourceError,
  SourceId,
} from "../../src/core";
import type { RootState } from "../store";
import {
  getAvailableSourceIds,
  loadBookContent,
  loadLocalBookProps,
  scanBooksFromAvailableSources,
} from "../../src/use-cases-injection/common-use-cases-injection";

type ShowcaseState = {
  status: "showing" | "content loading" | "reading" | "scanning";
  bookProps: Record<BookIdStr, BookProps>;
  availableSources: SourceId[];
  contentLoadState: BookRecord<{ elapsed: number; total: number }>;
  readingBook?: {
    id: BookId;
    props: BookProps;
    contentProps: BookContentProps;
    contentData: DataUri;
  };
};

const initialState: ShowcaseState = {
  status: "showing",
  availableSources: [],
  bookProps: {},
  contentLoadState: {},
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
    updateContentLoading: (
      state,
      action: PayloadAction<{ id: BookId; elapsed: number; total: number }>
    ) => {
      const { id, elapsed, total } = action.payload;
      const progress = {
        elapsed,
        total,
      };
      state.contentLoadState[bookIdToStr(id)] = progress;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadInitialBookPropsThunk.fulfilled, (state, action) => {
      const r = action.payload;
      if (r.err) {
        console.warn(r.val);
        return;
      }
      const [sources, props] = r.val;
      state.bookProps = props;
      state.availableSources = sources;
    });

    builder
      .addCase(readBookThunk.pending, (state, action) => {
        const { id } = action.meta.arg;
        delete state.contentLoadState[bookIdToStr(id)];
        state.status = "content loading";
      })
      .addCase(readBookThunk.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        delete state.contentLoadState[bookIdToStr(id)];
        if (action.payload.err) {
          // TODO: show error
          state.status = "showing";
          return;
        }
        const { props, contentProps, contentData } = action.payload.val;
        state.status = "reading";
        state.readingBook = {
          id: props.id,
          props,
          contentProps,
          contentData,
        };
      });
    builder
      .addCase(scanBooksThunk.pending, (state, action) => {
        state.status = "scanning";
      })
      .addCase(scanBooksThunk.fulfilled, (state, action) => {
        state.status = "showing";
        state.bookProps = action.payload;
      })
      .addCase(scanBooksThunk.rejected, (state, action) => {
        state.status = "showing";
      });
  },
});

export const loadInitialBookPropsThunk = createAsyncThunk<
  Result<[SourceId[], BookRecord<BookProps>], LocalRepositoryConnectionError>,
  {},
  { state: RootState }
>("showcase/loadInitialBookPropsThunk", async ({}, thunkApi) => {
  const sources = await getAvailableSourceIds.run();
  const props = await loadLocalBookProps.run();
  if (props.err) return props;
  return ok([sources, props.val]);
});

export const readBookThunk = createAsyncThunk<
  Result<
    { props: BookProps; contentProps: BookContentProps; contentData: DataUri },
    OnlineBookAndSourceError | LocalRepositoryConnectionError
  >,
  { id: BookId },
  { state: RootState }
>("showcase/readBookThunk", async ({ id }, thunkApi) => {
  const state = thunkApi.getState();
  const props = selectBookProps(state)[bookIdToStr(id)];
  const loadedContent = await loadBookContent.run(id, (elapsed, total) => {
    thunkApi.dispatch(updateContentLoading({ id, elapsed, total }));
  });
  if (loadedContent.err) return loadedContent;
  return ok({
    props,
    contentProps: loadedContent.val.props,
    contentData: loadedContent.val.data,
  });
});

export const scanBooksThunk = createAsyncThunk<
  Record<BookIdStr, BookProps>,
  void,
  { state: RootState }
>("showcase/scanBooksThunk", async (_, thunkApi) => {
  const r = await scanBooksFromAvailableSources.run();
  if (r.err) {
    return {};
  }
  return r.val;
});

export const { closeBook, updateContentLoading } = showcaseSlice.actions;

export const selectBookProps = (
  state: RootState
): Record<BookIdStr, BookProps> => {
  return state.showcase.bookProps;
};

export const selectReadingBook = (
  state: RootState
): Result<
  {
    id: BookId;
    props: BookProps;
    contentProps: BookContentProps;
    contentData: DataUri;
  },
  "not reading"
> => {
  const val = state.showcase.readingBook;
  if (val === undefined) return err("not reading");
  return ok(val);
};

export default showcaseSlice.reducer;
