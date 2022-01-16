import { BookId, BookIdStr } from "./types";

export const bookIdToStr = (id: BookId) => JSON.stringify(id);
export const bookIdStrToId = (idStr: BookIdStr) => JSON.parse(idStr);
