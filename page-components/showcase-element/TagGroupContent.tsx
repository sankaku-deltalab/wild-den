import * as React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
} from "@mui/material";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../redux-state/hooks";
import { TagGroupForShowcase } from "../../redux-state/slices/util/tag-group-for-showcase";

export type TagGroupContentProps = { group: TagGroupForShowcase };

const TagGroupContent: React.FC<TagGroupContentProps> = ({ group }) => {
  const dispatch = useAppDispatch();

  const media =
    group.thumbnail === undefined ? (
      <Box sx={{ minHeight: "140px" }}></Box>
    ) : (
      <CardMedia
        component="img"
        image={group.thumbnail}
        alt={group.name}
        sx={{ minHeight: "140px" }}
      />
    );

  return (
    <Link passHref href={`/tagged-books/${group.name}`}>
      <Card style={{ height: "100%" }}>
        <CardActionArea>
          <Box sx={{ position: "relative" }}>
            {media}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                bgcolor: "rgba(0, 0, 0, 0.54)",
                color: "white",
                padding: "0px",
              }}
            >
              <Typography variant="body2" component="div" color="text.primary">
                {group.name}
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default TagGroupContent;
