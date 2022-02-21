import { BookProps, BookRecord } from "./core-types";

/**
 * Sync two `BookProps` records.
 *
 * One side is books loaded from local.
 * Other side is books loaded from online.
 *
 * @param books1
 * @param books2
 * @returns Merged `BookProps`.
 */
export const syncBookProps = (
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
