import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Grid,
  Modal,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Card,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { pdfjs, Document, Page } from "react-pdf";
import { useWindowSize } from "usehooks-ts";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import { selectRawBookProps } from "../redux-state/slices/book-data-slice";
import { BookId, bookIdToStr, BookProps } from "../src/core";
import {
  loadBookForReadThunk,
  setBookIdOfReader,
} from "../redux-state/slices/book-reader-slice";

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

const BookReaderComponent: React.FC<{ id: BookId }> = ({ id }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const contentProps = useAppSelector((s) => s.bookReader.contentData);
  const contentData = useAppSelector((s) => s.bookReader.contentData);
  const loadProgress = useAppSelector(
    (s) => s.bookReader.contentLoadingProgress
  );
  const books = useAppSelector(selectRawBookProps);

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

  useEffect(() => {
    dispatch(setBookIdOfReader({ id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (contentData === undefined) {
      dispatch(loadBookForReadThunk({ id }));
    }
  }, [contentData, dispatch, id]);

  const book: BookProps | undefined = books[bookIdToStr(id)];
  const title = book ? book.title : "";

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const toggleMenu = () => {
    setMenuOpened((v) => !v);
  };

  const handleCloseBook = () => {
    dispatch(setBookIdOfReader({ id: undefined }));
    router.back();
  };

  const goToRight = () => {
    if (readDirection === "toRight") goToNextPage();
    else goToPrevPage();
  };

  const goToLeft = () => {
    if (readDirection === "toLeft") goToNextPage();
    else goToPrevPage();
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

  const fileDataUri = contentData ?? "";

  const pages = [pageNumber - 1, pageNumber, pageNumber + 1].filter(
    (v) => 1 <= v && v <= numPages
  );

  return (
    <>
      <Card sx={{ width: "100vw", height: "100vh" }}></Card>
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
      <PageSenderElement
        goToLeft={goToLeft}
        goToRight={goToRight}
        toggleMenu={toggleMenu}
      />
      <Modal open={menuOpened} onClose={() => setMenuOpened(false)}>
        <Card sx={modalStyle}>
          <div>{title}</div>
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
          <Button onClick={handleCloseBook}>Close Book</Button>
        </Card>
      </Modal>
    </>
  );
};

const PageSenderElement = (props: {
  goToLeft: () => void;
  toggleMenu: () => void;
  goToRight: () => void;
}) => {
  const { goToLeft, toggleMenu, goToRight } = props;
  return (
    <Grid
      style={{
        position: "fixed",
        height: "100vh",
        width: "100vw",
        left: "0px",
        top: "0px",
        flex: 1,
      }}
      sx={{ flexGrow: 1 }}
      container
      spacing={0}
    >
      <Grid item xs={4} onClick={goToLeft}></Grid>
      <Grid item xs={4} onClick={toggleMenu}></Grid>
      <Grid item xs={4} onClick={goToRight}></Grid>
    </Grid>
  );
};

export default BookReaderComponent;
