import { BookProps } from "./core-types";
import { FileProps } from "./book-source";

export const filePropsToBookProps = (
  now: string,
  file: FileProps
): BookProps => {
  const title = file.title ?? "no title";
  const author = file.author ?? "";
  const tagsByPath = file.path ? file.path.split("/") : [];
  const tags = [...file.givenTags, ...tagsByPath];
  return {
    id: file.id,
    lastModifiedDate: now,
    lastFileModifiedDate: file.lastModifiedDate,
    type: file.type,
    title,
    author,
    editableTags: tags,
    hidden: false,
    lastReadDate: "",
    readingState: "new",
    lastReadPage: 1,
  };
};
