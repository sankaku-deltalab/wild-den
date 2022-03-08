import assert from "assert";
import { BookIdStr, BookRecord, DataUri } from "../../../src/core";
import { BookPropsForShowcase } from "./book-props-for-showcase";

export type TagGroupForShowcase = {
  name: string;
  thumbnail?: DataUri;
  bookProps: BookRecord<BookPropsForShowcase>;
};

export const calcTagGroups = (
  props: BookRecord<BookPropsForShowcase>
): Record<string, TagGroupForShowcase> => {
  const tagMap: ReadonlyMap<string, ReadonlySet<BookIdStr>> = calcTagMap(props);
  const sortedTags = [...tagMap.keys()].sort();
  return Object.fromEntries(
    sortedTags.map((t) => {
      const bookIdStrSet = tagMap.get(t);
      assert(bookIdStrSet !== undefined);

      const propsRecords = Object.fromEntries(
        [...bookIdStrSet].map((idStr) => [idStr, props[idStr]])
      );

      return [
        t,
        {
          name: t,
          thumbnail: undefined,
          bookProps: propsRecords,
        },
      ];
    })
  );
};

const calcTagMap = (
  props: BookRecord<BookPropsForShowcase>
): ReadonlyMap<string, ReadonlySet<BookIdStr>> => {
  const tagMap = new Map<string, Set<BookIdStr>>();

  Object.entries(props).forEach(([idStr, p]) => {
    p.tags.forEach((t) => {
      const s = tagMap.get(t) ?? new Set();
      tagMap.set(t, s);
      s.add(idStr);
    });
  });
  return tagMap;
};
