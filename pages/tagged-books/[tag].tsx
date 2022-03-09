import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "../../redux-state/hooks";
import Showcase from "../../page-components/showcase";
import BookReader from "../../page-components/book-reader";
import { selectReadingBook } from "../../redux-state/slices/book-data-slice";
import styles from "../../styles/Home.module.css";
import { selectVisibleTaggedBooks } from "../../redux-state/slices/tagged-books-showcase-slice";
import TaggedBooksShowcase from "../../page-components/tagged-books-showcase";

const TaggedBooks: NextPage = () => {
  const books = useAppSelector(selectVisibleTaggedBooks);

  return (
    <div className={styles.container}>
      <Head>
        <title>Wild Den</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <TaggedBooksShowcase />
      </main>
    </div>
  );
};

export default TaggedBooks;
