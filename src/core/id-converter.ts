import { BookId, BookIdStr, SourceId, SourceIdStr } from "./core-types";

export const bookIdToStr = (id: BookId): BookIdStr => JSON.stringify(id);
export const bookIdStrToId = (idStr: BookIdStr): BookId => JSON.parse(idStr);

export const sourceIdToStr = (id: SourceId): SourceIdStr => JSON.stringify(id);
export const sourceIdStrToId = (idStr: SourceIdStr): SourceId =>
  JSON.parse(idStr);
