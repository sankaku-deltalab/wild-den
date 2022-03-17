import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppSelector, useAppDispatch } from "../../../redux-state/hooks";
import Showcase from "../../../page-components/showcase";
import BookReaderComponent from "../../../page-components/book-reader-component";
import styles from "../../../styles/Home.module.css";
import {
  base64ToBookId,
  bookIdToBase64,
} from "../../../redux-state/slices/util/book-id-url-converter";

const BookReader: NextPage = () => {
  const router = useRouter();

  const { bookId } = router.query;
  const id = base64ToBookId(bookId as string);

  return (
    <div className={styles.container}>
      <Head>
        <title>Wild Den</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <BookReaderComponent id={id} />
      </main>
    </div>
  );
};

export default BookReader;
