import * as React from "react";
import { Grid } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import TagGroupContent from "./TagGroupContent";
import { selectVisibleTagGroups } from "../../redux-state/slices/main-showcase-slice";

export type TagGroupsProps = {};

const TagGroups: React.FC<TagGroupsProps> = (props) => {
  const dispatch = useAppDispatch();
  const tagGroups = useAppSelector(selectVisibleTagGroups);

  return (
    <Grid container spacing={1}>
      {tagGroups.map((group) => (
        <Grid key={group.name} item xs={4} sm={3} md={2} lg={1}>
          <TagGroupContent group={group} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TagGroups;
