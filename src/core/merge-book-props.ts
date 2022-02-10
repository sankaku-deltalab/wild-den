import { BookProps, BookRecord } from "./core-types";

/**
 * Merge two `BookProps`.
 *
 * @param props1
 * @param props2
 * @returns Merged `BookProps`.
 */
export const mergeBookProps = (
  props1: BookRecord<BookProps>,
  props2: BookRecord<BookProps>
): BookRecord<BookProps> => {
  // TODO: impl this.
  return Object.assign({}, props1, props2);
};
