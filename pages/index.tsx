import type { NextPage } from "next";
import Head from "next/head";
import { useAppSelector } from "../redux-state/hooks";
import Showcase from "../page-components/showcase";
import BookReader from "../page-components/book-reader";
import { selectReadingBook } from "../redux-state/slices/showcase-slice";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const readingBook = useAppSelector(selectReadingBook);

  const isReading = readingBook.ok;

  return (
    <div className={styles.container}>
      <Head>
        <title>Wild Den</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isReading ? <BookReader /> : <Showcase />}
      </main>
    </div>
  );
};

export default Home;
