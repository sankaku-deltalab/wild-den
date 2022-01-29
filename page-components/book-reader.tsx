import { useState } from "react";
import { Button } from "@mui/material";
import { pdfjs, Document, Page } from "react-pdf";
import { useAppSelector, useAppDispatch } from "../redux-state/hooks";
import {
  closeBook,
  selectReadingBook,
} from "../redux-state/slices/showcase-slice";

// TODO: ローカルファイルに依存するようにする
// https://zenn.dev/kin/articles/658b06a3233e60
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const BookReader: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const readingBook = useAppSelector(selectReadingBook);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const file = readingBook.err ? "" : `${readingBook.val.blob.blob}`;

  const pdfProps = readingBook.err ? "" : readingBook.val.props;
  return (
    <>
      <div>reading...</div>
      <div>{JSON.stringify(pdfProps, null, 4)}</div>
      <div>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(e) => console.log(e)}
          options={{
            cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`, // TODO: ローカルファイルに依存するようにする
            cMapPacked: true,
          }}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <Button onClick={() => setPageNumber((v) => Math.min(v + 1, numPages))}>
          Next page
        </Button>
        <Button onClick={() => setPageNumber((v) => Math.max(v - 1, 1))}>
          Prev page
        </Button>
      </div>
      <Button onClick={() => dispatch(closeBook())}>Close</Button>
    </>
  );
};

export default BookReader;
