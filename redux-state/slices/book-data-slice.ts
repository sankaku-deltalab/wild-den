import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
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
  syncBookProps,
} from "../../src/use-cases-injection/common-use-cases-injection";
import { searchBooks } from "./util/book-searching";
import {
  BookPropsForShowcase,
  convertBookPropsToShowcaseStyle,
} from "./util/book-props-for-showcase";
import { mapObj } from "../../src/util";

type BookDataState = {
  status: "showing" | "content loading" | "reading" | "scanning";
  bookProps: Record<BookIdStr, BookProps>;
  availableSources: SourceId[];
  contentLoadState: BookRecord<{ elapsed: number; total: number }>;
  searchText: string;
  readingBook?: {
    id: BookId;
    props: BookProps;
    contentProps: BookContentProps;
    contentData: DataUri;
  };
};

const initialState: BookDataState = {
  status: "showing",
  availableSources: [],
  bookProps: {},
  contentLoadState: {},
  searchText: "",
  readingBook: undefined,
};

export const bookDataSlice = createSlice({
  name: "bookData",
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
    updateSearchText: (state, action: PayloadAction<{ text: string }>) => {
      state.searchText = action.payload.text;
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
        state.contentLoadState[bookIdToStr(id)] = { elapsed: 0, total: 1 };
        state.status = "content loading";
      })
      .addCase(readBookThunk.rejected, (state, action) => {
        const { id } = action.meta.arg;
        delete state.contentLoadState[bookIdToStr(id)];
        console.warn("readBookThunk rejected", action);
        state.status = "showing";
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

    builder.addCase(syncBooksThunk.fulfilled, (state, action) => {
      state.bookProps = action.payload;
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
>("bookData/loadInitialBookPropsThunk", async ({}, thunkApi) => {
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
>("bookData/readBookThunk", async ({ id }, thunkApi) => {
  const state = thunkApi.getState();
  const props = selectRawBookProps(state)[bookIdToStr(id)];
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
>("bookData/scanBooksThunk", async (_, thunkApi) => {
  const r = await scanBooksFromAvailableSources.run();
  if (r.err) {
    return {};
  }
  return r.val;
});

export const syncBooksThunk = createAsyncThunk<
  BookRecord<BookProps>,
  void,
  { state: RootState }
>("bookData/syncBooksThunk", async (_, thunkApi) => {
  const sources = await getAvailableSourceIds.run();
  for (const s of sources) {
    await syncBookProps.run(s);
  }
  const props = await loadLocalBookProps.run();
  if (props.err) return {};
  return props.val;
});

export const { closeBook, updateContentLoading, updateSearchText } =
  bookDataSlice.actions;

export const selectRawBookProps = (
  state: RootState
): Record<BookIdStr, BookProps> => {
  return state.bookData.bookProps;
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
  const val = state.bookData.readingBook;
  if (val === undefined) return err("not reading");
  return ok(val);
};

export const selectBookPropsForShowcase = createSelector(
  selectRawBookProps,
  (bookProps): BookRecord<BookPropsForShowcase> => {
    return mapObj(bookProps, (key, p) => convertBookPropsToShowcaseStyle(p));
  }
);

export const selectShowcaseMode = (
  state: RootState
): "main" | "taggedBooks" => {
  // if (state.bookData.taggedBooksShowcase !== undefined) return "taggedBooks";
  return "main";
};

export const selectSortedBookProps = (
  state: RootState
): [BookIdStr, BookPropsForShowcase][] => {
  return Object.entries(state.bookData.bookProps)
    .map<[BookIdStr, BookPropsForShowcase]>(([key, props]) => [
      key,
      convertBookPropsToShowcaseStyle(props),
    ])
    .sort(([aKey, a], [bKey, b]) => a.title.localeCompare(b.title));
};

export const selectSearchText = (state: RootState): string =>
  state.bookData.searchText;

export const selectSearchedBooks = createSelector(
  selectRawBookProps,
  selectSearchText,
  (bookProps, searchText): [BookIdStr, BookPropsForShowcase][] => {
    if (searchText === "")
      return Object.entries(bookProps)
        .map<[BookIdStr, BookPropsForShowcase]>(([key, props]) => [
          key,
          convertBookPropsToShowcaseStyle(props),
        ])
        .sort(([aKey, a], [bKey, b]) => a.title.localeCompare(b.title));

    const searched = searchBooks(
      searchText,
      Object.values(bookProps).map((p) => convertBookPropsToShowcaseStyle(p))
    );
    return searched
      .map<[BookIdStr, BookPropsForShowcase]>((b) => [bookIdToStr(b.id), b])
      .sort(([aKey, a], [bKey, b]) => a.title.localeCompare(b.title));
  }
);

export default bookDataSlice.reducer;
