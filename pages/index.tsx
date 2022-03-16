import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useAppSelector } from "../redux-state/hooks";
import Showcase from "../page-components/showcase";
import BookReaderComponent from "../page-components/book-reader-component";
import { selectReadingBook } from "../redux-state/slices/book-data-slice";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const readingBook = useAppSelector(selectReadingBook);

  return (
    <div className={styles.container}>
      <Head>
        <title>Wild Den</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Showcase />
      </main>
    </div>
  );
};

export default Home;
