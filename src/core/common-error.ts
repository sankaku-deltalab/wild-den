import { BookId, SourceId } from ".";

type ErrorBase<Type extends string, Payload extends Object> = {
  type: Type;
  payload: Payload;
};

export type CommonOnlineError = OfflineError | NotLoggedInError;
export type OnlineBookError =
  | OfflineError
  | NotLoggedInError
  | BookNotExistsInSourceError;

export type OnlineSourceError =
  | OfflineError
  | NotLoggedInError
  | SourceNotAvailableError;

export type LocalRepositoryBookError =
  | LocalRepositoryConnectionError
  | BookNotExistsInLocalRepositoryError;

export type OfflineError = ErrorBase<"offline", {}>;
export const offlineError = (): OfflineError => ({
  type: "offline",
  payload: {},
});

export type NotLoggedInError = ErrorBase<
  "not logged in",
  { sourceId: SourceId }
>;
export const notLoggedInError = (sourceId: SourceId): NotLoggedInError => ({
  type: "not logged in",
  payload: { sourceId },
});

export type BookNotExistsInSourceError = ErrorBase<
  "book not exists in source",
  { bookId: BookId }
>;
export const bookNotExistsInSourceError = (
  bookId: BookId
): BookNotExistsInSourceError => ({
  type: "book not exists in source",
  payload: { bookId },
});

export type SourceNotAvailableError = ErrorBase<
  "source is not available",
  { sourceId: SourceId }
>;
export const sourceNotAvailableError = (
  sourceId: SourceId
): SourceNotAvailableError => ({
  type: "source is not available",
  payload: { sourceId },
});

export type LocalRepositoryConnectionError = ErrorBase<
  "local repository connection failed",
  { message: string }
>;
export const localRepositoryConnectionError = (
  message: string
): LocalRepositoryConnectionError => ({
  type: "local repository connection failed",
  payload: { message },
});

export type BookNotExistsInLocalRepositoryError = ErrorBase<
  "book not in local repository",
  { bookId: BookId }
>;
export const bookNotExistsInLocalRepositoryError = (
  bookId: BookId
): BookNotExistsInLocalRepositoryError => ({
  type: "book not in local repository",
  payload: { bookId },
});
