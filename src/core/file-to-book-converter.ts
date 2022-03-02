import { BookAutoTag } from ".";
import { BookProps } from "./core-types";
import { FileProps } from "./interfaces";

export const filePropsToBookProps = (
  now: string,
  file: FileProps
): BookProps => {
  const title = file.title ?? file.fileName ?? "no title";
  const author = file.author ?? "";
  const path = file.path ? file.path.split("/") : [];
  const tagsByPath = [...new Set(path)]
    .filter((p) => p.length > 0)
    .map((p) => ({ type: "path", name: p }));
  const givenTags = file.givenTags.map((t) => ({
    type: "fileGiven",
    name: t,
  }));
  const autoTags: BookAutoTag[] = [...tagsByPath, ...givenTags];

  return {
    id: file.id,
    lastModifiedDate: now,
    lastFileModifiedDate: file.lastModifiedDate,
    type: file.type,
    title,
    author,
    autoTags,
    manualTags: [],
    hiddenAutoTagNames: [],
    hidden: false,
    lastReadDate: "",
    readingState: "new",
    lastReadPage: 1,
    readDirection: "toRight",
  };
};
