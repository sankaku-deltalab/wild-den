import { useEffect } from "react";
import { Card } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  loadInitialBookPropsThunk,
  selectShowcaseMode,
} from "../redux-state/slices/book-data-slice";
import NavigationBar from "./showcase-element/NavigationBar";
import BottomBar from "./showcase-element/BottomBar";
import TagGroups from "./showcase-element/TagGroups";
import TaggedBooks from "./showcase-element/TaggedBooks";

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectShowcaseMode);

  // run only first time
  useEffect(() => {
    const f = async () => {
      dispatch(loadInitialBookPropsThunk({}));
    };
    f();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NavigationBar />
      <Card sx={{ width: "100%" }}>
        {mode === "main" ? <TagGroups /> : <></>}
        {mode === "taggedBooks" ? <TaggedBooks /> : <></>}
      </Card>
      <BottomBar />
    </>
  );
};

export default Showcase;
