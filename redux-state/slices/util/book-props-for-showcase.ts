import {
  BookId,
  BookProps,
  BookType,
  ReadDirection,
  ReadingState,
} from "../../../src/core";
import { DateTime } from "../../../src/util";

export type BookPropsForShowcase = {
  id: BookId;
  lastModifiedDate: DateTime;
  lastFileModifiedDate: DateTime;
  type: BookType;
  title: string;
  author: string;
  tags: string[];
  hidden: boolean;
  lastReadDate: string;
  readingState: ReadingState;
  lastReadPage: number;
  readDirection: ReadDirection;
};

export const convertBookPropsToShowcaseStyle = (
  props: BookProps
): BookPropsForShowcase => {
  const hiddenAutoTagNameSet = new Set(props.hiddenAutoTagNames);
  const autoTags = props.autoTags
    .map((t) => t.name)
    .filter((t) => !hiddenAutoTagNameSet.has(t));
  const tags = [...autoTags, ...props.manualTags];
  return {
    id: props.id,
    lastModifiedDate: props.lastModifiedDate,
    lastFileModifiedDate: props.lastFileModifiedDate,
    type: props.type,
    title: props.title,
    author: props.author,
    tags,
    hidden: props.hidden,
    lastReadDate: props.lastReadDate,
    readingState: props.readingState,
    lastReadPage: props.lastReadPage,
    readDirection: props.readDirection,
  };
};
