import {
  BookCacheRepository,
  LoadBookBlob,
  ScanBooks,
  GetCachedBooks,
  getMsalInstance,
} from "../../../src";
import { BookCacheRepositoryMock } from "../../book-cache-repository-mock";
import { dateUtil } from "./util";

export const cache: BookCacheRepository = new BookCacheRepositoryMock();
export const getCachedBooksUc = new GetCachedBooks();
export const loadBookBlob = new LoadBookBlob(dateUtil);
export const scanBooksUC = new ScanBooks(dateUtil);
export const msalInstance = getMsalInstance();
