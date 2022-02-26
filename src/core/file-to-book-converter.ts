import { BookAutoTag } from ".";
import { BookProps } from "./core-types";
import { FileProps } from "./interfaces";

export const filePropsToBookProps = (
  now: string,
  file: FileProps
): BookProps => {
  const title = file.title ?? file.fileName ?? "no title";
  const author = file.author ?? "";
  const tagsByPath = file.path ? file.path.split("/") : [];
  const autoTags: BookAutoTag[] = file.givenTags.map((t) => ({
    type: "fileGiven",
    name: t,
  }));
  return {
    id: file.id,
    lastModifiedDate: now,
    lastFileModifiedDate: file.lastModifiedDate,
    type: file.type,
    title,
    author,
    autoTags,
    manualTags: tagsByPath,
    hiddenAutoTagNames: [],
    hidden: false,
    lastReadDate: "",
    readingState: "new",
    lastReadPage: 1,
    readDirection: "toRight",
  };
};
