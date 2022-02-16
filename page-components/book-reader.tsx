import { useState } from "react";
import {
  Button,
  Grid,
  Modal,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { pdfjs, Document, Page } from "react-pdf";
import { useWindowSize } from "usehooks-ts";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  closeBook,
  selectReadingBook,
} from "../redux-state/slices/showcase-slice";

// TODO: ローカルファイルに依存するようにする
// https://zenn.dev/kin/articles/658b06a3233e60
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type Size2d = { height: number; width: number };

const BookReader: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const readingBook = useAppSelector(selectReadingBook);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [readDirection, setReadDirection] = useState<"toLeft" | "toRight">(
    "toRight"
  );
  const [menuOpened, setMenuOpened] = useState(false);
  const windowSize = useWindowSize();
  const [originalPageSizes, setOriginalPageSizes] = useState<
    Record<number, Size2d>
  >({});

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const toggleMenu = () => {
    setMenuOpened((v) => !v);
  };

  const goToRight = () => {
    if (readDirection === "toRight") goToNextPage();
    else goToPrevPage();
  };

  const goToLeft = () => {
    if (readDirection === "toLeft") goToNextPage();
    else goToPrevPage();
  };

  const toggleReadDirection = () => {
    setReadDirection((prev) => (prev === "toLeft" ? "toRight" : "toLeft"));
  };

  const goToNextPage = () => {
    setPageNumber((v) => Math.min(v + 1, numPages));
  };

  const goToPrevPage = () => {
    setPageNumber((v) => Math.max(v - 1, 1));
  };

  const pageHeight = (page: number): number => {
    const originalPageSize = originalPageSizes[page];
    if (originalPageSize === undefined) return 0;
    const vScale = windowSize.height / originalPageSize.height;
    const hScale = windowSize.width / originalPageSize.width;
    const scale = Math.min(vScale, hScale);
    return Math.floor(originalPageSize.height * scale);
  };

  const fileDataUri = readingBook.err ? "" : `${readingBook.val.contentData}`;
  const bookProps = readingBook.err ? "" : readingBook.val.props;

  const pages = [pageNumber - 1, pageNumber, pageNumber + 1];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "0px",
          left: "50%",
          transform: "translate(-50%, 0%)",
        }}
      >
        <Document
          file={fileDataUri}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(e) => console.log(e)}
          options={{
            cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`, // TODO: ローカルファイルに依存するようにする
            cMapPacked: true,
          }}
        >
          {pages.map((i) => (
            <span
              key={i.toString()}
              style={{
                opacity: i === pageNumber ? 1 : 0,
                position: "fixed",
                transform: "translate(-50%, 0%)",
              }}
            >
              <Page
                key={i.toString()}
                pageNumber={i}
                height={pageHeight(i)}
                onLoadSuccess={(p) => {
                  setOriginalPageSizes((v) => ({
                    [i]: {
                      height: p.originalHeight,
                      width: p.originalWidth,
                    },
                    ...v,
                  }));
                }}
              />
            </span>
          ))}
        </Document>
      </div>
      <Grid
        style={{ position: "fixed", height: "100vh" }}
        sx={{ flexGrow: 1 }}
        container
        spacing={0}
      >
        <Grid item xs={4} onClick={goToLeft}></Grid>
        <Grid item xs={4} onClick={toggleMenu}></Grid>
        <Grid item xs={4} onClick={goToRight}></Grid>
      </Grid>
      <Modal open={menuOpened} onClose={() => setMenuOpened(false)}>
        <Box sx={modalStyle}>
          <div>{readingBook.err ? "" : readingBook.val.props.title}</div>
          <div>
            Direction:
            <ToggleButtonGroup
              size="small"
              value={readDirection}
              exclusive
              onChange={(e, next) =>
                next === null ? {} : setReadDirection(next)
              }
            >
              <ToggleButton value="toLeft">
                <ChevronLeft fontSize="small" />
              </ToggleButton>
              <ToggleButton value="toRight">
                <ChevronRight fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div>
            Progress: {pageNumber} / {numPages}
          </div>
          <Button onClick={() => dispatch(closeBook())}>Close Book</Button>
        </Box>
      </Modal>
    </>
  );
};

export default BookReader;
