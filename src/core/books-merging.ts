import { filePropsToBookProps } from "./file-to-book-converter";
import { DateTime, mapObj } from "../util";
import { BookProps, BookRecord, BookId } from "./core-types";
import { FileProps } from "./interfaces";
import { bookIdStrToId } from "./id-converter";

export type BookPropsUpdateOrder = {
  mergedProps: BookRecord<BookProps>;
  onlinePropsDiff: BooksDiff;
  localPropsDiff: BooksDiff;
};

export type BooksDiff = {
  add: ReadonlySet<BookId>;
  delete: ReadonlySet<BookId>;
  update: ReadonlySet<BookId>;
};

/**
 * Merge scanned file and already loaded books.
 *
 * NOTE: Books id not in files would be deleted.
 *
 * @param now
 * @param scannedFiles
 * @param onlineBooks
 * @returns
 */
export const mergeScannedFilesAndLoadedBooks = (
  now: DateTime,
  scannedFiles: BookRecord<FileProps>,
  onlineBooks: BookRecord<BookProps>,
  localBooks: BookRecord<BookProps>
): BookPropsUpdateOrder => {
  const books = mergeBookProps(onlineBooks, localBooks);
  const mergedProps = Object.fromEntries(
    Object.keys(scannedFiles).map((k) => {
      const oldBook = books[k];
      if (oldBook !== undefined) return [k, oldBook];

      const newBook = filePropsToBookProps(now, scannedFiles[k]);
      return [k, newBook];
    })
  );
  return {
    mergedProps,
    onlinePropsDiff: calcBooksDiff(mergedProps, onlineBooks),
    localPropsDiff: calcBooksDiff(mergedProps, localBooks),
  };
};

/**
 * Sync two `BookProps` records.
 *
 * @param onlineBooks
 * @param localBooks
 * @returns Merged `BookProps`.
 */
export const syncBookProps = (
  onlineBooks: BookRecord<BookProps>,
  localBooks: BookRecord<BookProps>
): BookPropsUpdateOrder => {
  const mergedProps = mergeBookProps(onlineBooks, localBooks);
  return {
    mergedProps,
    onlinePropsDiff: calcBooksDiff(mergedProps, onlineBooks),
    localPropsDiff: calcBooksDiff(mergedProps, localBooks),
  };
};

const calcBooksDiff = (
  newBooks: BookRecord<BookProps>,
  oldBooks: BookRecord<BookProps>
): BooksDiff => {
  const how: BookRecord<"add" | "delete" | "update" | "no-change"> = mapObj(
    oldBooks,
    (key, p) => {
      if (newBooks[key] === undefined) return "delete";
      if (oldBooks[key] === undefined) return "add";
      const oldBook = oldBooks[key];
      const newBook = newBooks[key];
      if (newBook.lastModifiedDate > oldBook.lastModifiedDate) return "update";
      return "no-change";
    }
  );
  const howToSet = (v: "add" | "delete" | "update" | "no-change") =>
    new Set(
      Object.entries(how)
        .filter(([key, how]) => how === v)
        .map(([key, how]) => bookIdStrToId(key))
    );
  return {
    add: howToSet("add"),
    delete: howToSet("delete"),
    update: howToSet("update"),
  };
};

/**
 * Merge two book records.
 *
 * - If book exists in only one side, returned contain it.
 * - If book exists in each side, returned contain later modified book.
 *
 * @param books1
 * @param books2
 * @returns
 */
const mergeBookProps = (
  books1: BookRecord<BookProps>,
  books2: BookRecord<BookProps>
): BookRecord<BookProps> => {
  const bookKeys = Object.keys(Object.assign({}, books1, books2));
  return Object.fromEntries(
    bookKeys.map((k) => {
      const [b1, b2] = [books1[k], books2[k]];
      if (b1 === undefined) return [k, b2];
      if (b2 === undefined) return [k, b1];
      if (b1.lastModifiedDate > b2.lastModifiedDate) return [k, b1];
      return [k, b2];
    })
  );
};
