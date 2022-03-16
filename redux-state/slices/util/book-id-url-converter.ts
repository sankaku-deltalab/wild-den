import { encode as base64Encode, decode as base64Decode } from "js-base64";
import {
  BookId,
  BookIdStr,
  bookIdStrToId,
  bookIdToStr,
} from "../../../src/core";

export const bookIdToBase64 = (book: BookId): string => {
  return base64Encode(bookIdToStr(book), true);
};

export const base64ToBookId = (base64BookId: BookIdStr): BookId => {
  return bookIdStrToId(base64Decode(base64BookId));
};
