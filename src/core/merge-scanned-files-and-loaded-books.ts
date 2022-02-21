import { filePropsToBookProps } from "./file-to-book-converter";
import { DateTime } from "../util";
import { BookProps, BookRecord } from "./core-types";
import { FileProps } from "./interfaces";

/**
 * Merge scanned file and already loaded books.
 *
 * NOTE: Books id not in files would be deleted.
 *
 * @param now
 * @param scannedFiles
 * @param books
 * @returns
 */
export const mergeScannedFilesAndLoadedBooks = (
  now: DateTime,
  scannedFiles: BookRecord<FileProps>,
  books: BookRecord<BookProps>
): BookRecord<BookProps> => {
  return Object.fromEntries(
    Object.keys(scannedFiles).map((k) => {
      const oldBook = books[k];
      if (oldBook !== undefined) return [k, oldBook];

      const newBook = filePropsToBookProps(now, scannedFiles[k]);
      return [k, newBook];
    })
  );
};
