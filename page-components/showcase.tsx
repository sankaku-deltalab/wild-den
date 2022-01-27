import { List, ListItem, ListItemButton, Button } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import { scanBooks, loadBlob } from "../redux-state/slices/showcase-slice";

const Showcase: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.showcase.bookProps);
  const sources = useAppSelector((state) =>
    Object.values(state.showcase.sources)
  );
  const cache = useAppSelector((state) => state.showcase.cache);

  return (
    <>
      books
      <Button
        onClick={() =>
          sources.forEach((s) => dispatch(scanBooks({ source: s, cache })))
        }
      >
        Scan
      </Button>
      <List>
        {Object.entries(books).map(([idStr, props]) => (
          <ListItem key={idStr}>
            <ListItemButton
              onClick={() => {
                dispatch(loadBlob({ id: props.id, sources, cache }));
              }}
            >
              {props.title}
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem></ListItem>
      </List>
    </>
  );
};

export default Showcase;
