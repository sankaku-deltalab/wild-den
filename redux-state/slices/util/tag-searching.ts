import Fuse from "fuse.js";
import { TagGroupForShowcase } from "./tag-group-for-showcase";

export const searchTagGroups = (
  searchText: string,
  groups: TagGroupForShowcase[]
): TagGroupForShowcase[] => {
  if (searchText === "") return groups;

  const options: Fuse.IFuseOptions<TagGroupForShowcase> = {
    threshold: 0,
    keys: ["name"],
  };
  const fuse = new Fuse<TagGroupForShowcase>(groups, options);
  return fuse.search(searchText).map((r) => r.item);
};
