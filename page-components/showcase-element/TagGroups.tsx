import * as React from "react";
import { Grid } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import { selectSortedTagGroups } from "../../redux-state/slices/showcase-slice";
import TagGroupContent from "./TagGroupContent";

export type TagGroupsProps = {};

const TagGroups: React.FC<TagGroupsProps> = (props) => {
  const dispatch = useAppDispatch();
  const tagGroups = useAppSelector(selectSortedTagGroups);

  return (
    <Grid container spacing={1}>
      {tagGroups.map(([tag, group]) => (
        <Grid key={tag} item xs={4} sm={3} md={2} lg={1}>
          <TagGroupContent group={group} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TagGroups;
