import Fuse from "fuse.js";
import { BookProps } from "../../../src/core";

export type SearchElement =
  | { type: "raw-text"; text: string }
  | { type: "tag"; tag: string };

export const searchBooks = (
  searchText: string,
  bookArray: BookProps[]
): BookProps[] => {
  const fuse = new Fuse(bookArray);
  return fuse.search(searchText).map((r) => r.item);
};
