import Fuse from "fuse.js";
import { BookPropsForShowcase } from "./book-props-for-showcase";

export const searchBooks = (
  searchText: string,
  bookArray: BookPropsForShowcase[]
): BookPropsForShowcase[] => {
  const options: Fuse.IFuseOptions<BookPropsForShowcase> = {
    threshold: 0,
    keys: ["title", "tags"],
  };
  const fuse = new Fuse<BookPropsForShowcase>(bookArray, options);
  return fuse.search(searchText).map((r) => r.item);
};
