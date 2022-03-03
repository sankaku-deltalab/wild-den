import Fuse from "fuse.js";
import { BookProps } from "../../../src/core";

export type SearchElement =
  | { type: "raw-text"; text: string }
  | { type: "tag"; tag: string };

export const searchBooks = (
  searchText: string,
  bookArray: BookProps[]
): BookProps[] => {
  const options: Fuse.IFuseOptions<BookProps> = {
    threshold: 0,
    keys: ["title", "autoTags.name", "manualTags"],
  };
  const fuse = new Fuse<BookProps>(bookArray, options);
  return fuse.search(searchText).map((r) => r.item);
};
