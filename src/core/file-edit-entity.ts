import { filterObj } from "../util";
import { BookId, BookIdStr, SourceId, BookFileProps, BookProps } from "./types";

export const fileToBookProps = (
  now: string,
  file: BookFileProps
): BookProps => {
  const title = file.title ?? "no title";
  const author = file.author ?? "";
  const tags = file.path ? file.path.split("/") : [];
  return {
    id: file.id,
    lastLoadedDate: now,
    type: file.type,
    title,
    author,
    tags,
    hidden: false,
    lastReadDate: "",
    readState: "new",
  };
};

export const updateBooksProps = (
  newProps: Record<BookIdStr, BookProps>,
  oldProps: Record<BookIdStr, BookProps>,
  source: SourceId
): Record<BookIdStr, BookProps> => {
  // remove erased old books
  const oldProps2 = filterObj(
    oldProps,
    (k, v) => v.id.source !== source || k in newProps
  );

  return Object.assign({}, newProps, oldProps2);
};
