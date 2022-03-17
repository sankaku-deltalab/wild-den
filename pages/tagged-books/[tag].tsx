import type { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/Home.module.css";
import TaggedBooksShowcase from "../../page-components/tagged-books-showcase";

const TaggedBooks: NextPage = () => {
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
