import { injectable, singleton } from "tsyringe";
import Dexie, { Transaction } from "dexie";
import { v4 as uuidv4 } from "uuid";
import { Result, ok, err } from "../results";
import {
  BookProps,
  BookId,
  bookIdToStr,
  BookContentProps,
  LocalRepositoryConnectionError,
  SourceId,
  BookThumbnailProps,
  BookRecord,
  bookNotExistsInLocalRepositoryError,
  LocalRepositoryBookError,
  sourceIdToStr,
  DataUri,
  BookIdStr,
  SourceIdStr,
  localRepositoryConnectionError,
  bookIdStrToId,
} from "../core";
import { LocalBookRepository } from "../core/interfaces";

type BookIdReplaced<T extends { id: BookId }> = Omit<T, "id"> & {
  idStr: BookIdStr;
  sourceIdStr: SourceIdStr;
};

const thingToRecord = <T extends { id: BookId }>(v: T): BookIdReplaced<T> => {
  const { id, ...v2 } = v;
  const r = {
    idStr: bookIdToStr(v.id),
    sourceIdStr: sourceIdToStr(v.id.source),
    ...v2,
  };
  return r;
};

type BookPropsRecord = BookIdReplaced<BookProps>;
type BookContentPropsRecord = BookIdReplaced<BookContentProps>;
type BookThumbnailPropsRecord = BookIdReplaced<BookThumbnailProps>;
type BookContentData = { idStr: BookIdStr; parts: string[] };
type BookContentDataPart = {
  id: string;
  bookIdStr: BookIdStr;
  dataPart: DataUri;
};
type BookThumbnailData = { idStr: BookIdStr; data: DataUri };

class LocalBookRepositoryDatabase extends Dexie {
  bookProps!: Dexie.Table<BookPropsRecord, string>;
  bookContentProps!: Dexie.Table<BookContentPropsRecord, string>;
  bookThumbnailProps!: Dexie.Table<BookThumbnailPropsRecord, string>;
  bookContentData!: Dexie.Table<BookContentData, string>;
  bookContentDataPart!: Dexie.Table<BookContentDataPart, string>;
  bookThumbnailData!: Dexie.Table<BookThumbnailData, string>;

  constructor() {
    super("WildDenDatabase");
    this.version(2).stores({
      bookProps: "idStr, sourceIdStr",
      bookContentProps: "idStr, sourceIdStr",
      bookThumbnailProps: "idStr, sourceIdStr",
      bookContentData: "idStr, sourceIdStr",
      bookContentDataPart: "id, bookIdStr",
      bookThumbnailData: "idStr, sourceIdStr",
    });
  }
}

const bookPropsTable = (s: Transaction) =>
  s.table<BookPropsRecord, string>("bookProps");

const bookContentProps = (s: Transaction) =>
  s.table<BookContentPropsRecord, string>("bookContentProps");

const bookThumbnailProps = (s: Transaction) =>
  s.table<BookThumbnailPropsRecord, string>("bookThumbnailProps");

const bookContentData = (s: Transaction) =>
  s.table<BookContentData, string>("bookContentData");

const bookContentDataPart = (s: Transaction) =>
  s.table<BookContentDataPart, string>("bookContentDataPart");

const bookThumbnailData = (s: Transaction) =>
  s.table<BookThumbnailData, string>("bookThumbnailData");

const bookPropsRecordToOriginal = (r: BookPropsRecord): BookProps => {
  return {
    id: bookIdStrToId(r.idStr),
    lastModifiedDate: r.lastModifiedDate,
    lastFileModifiedDate: r.lastFileModifiedDate,
    type: r.type,
    title: r.title,
    author: r.author,
    autoTags: r.autoTags.map((t) => ({ type: t.type, name: t.name })),
    editableTags: r.editableTags,
    hiddenAutoTagNames: r.hiddenAutoTagNames,
    hidden: r.hidden,
    lastReadDate: r.lastReadDate,
    readingState: r.readingState,
    lastReadPage: r.lastReadPage,
    readDirection: r.readDirection,
  };
};

const bookContentPropsRecordToOriginal = (
  r: BookContentPropsRecord
): BookContentProps => {
  return {
    id: bookIdStrToId(r.idStr),
    loadedDate: r.loadedDate,
    lastFileModifiedDate: r.lastFileModifiedDate,
    type: r.type,
    fileSizeByte: r.fileSizeByte,
  };
};

const bookThumbnailPropsRecordToOriginal = (
  r: BookThumbnailPropsRecord
): BookThumbnailProps => {
  return {
    id: bookIdStrToId(r.idStr),
    loadedDate: r.loadedDate,
    lastFileModifiedDate: r.lastFileModifiedDate,
    fileSizeByte: r.fileSizeByte,
  };
};

const splitData = (original: DataUri): string[] => {
  // https://stackoverflow.com/questions/10474992/split-a-javascript-string-into-fixed-length-pieces
  const maxDataLen = 2 ** 20; // 1MiB
  const re = new RegExp(`(.{1,${maxDataLen}})`, "g");
  const parts = original.match(re);
  if (parts === null) throw new Error("splitData error");
  return parts;
};

const arrayIsNotUndefined = <T>(v: (T | undefined)[]): v is T[] => {
  for (const e of v) {
    if (e === undefined) return false;
  }
  return true;
};

@singleton()
@injectable()
export class DexieLocalBookRepository implements LocalBookRepository {
  private readonly db = new LocalBookRepositoryDatabase();

  async clean(): Promise<Result<void, LocalRepositoryConnectionError>> {
    const f = async (s: Transaction) => {
      await Promise.all([
        bookPropsTable(s).clear(),
        bookContentProps(s).clear(),
        bookThumbnailProps(s).clear(),
        bookContentData(s).clear(),
        bookContentDataPart(s).clear(),
        bookThumbnailData(s).clear(),
      ]);
    };

    try {
      await this.db.transaction(
        "rw",
        [
          this.db.bookProps,
          this.db.bookContentProps,
          this.db.bookThumbnailProps,
          this.db.bookContentData,
          this.db.bookContentDataPart,
          this.db.bookThumbnailData,
        ],
        f
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
    return ok(undefined);
  }

  /**
   * Reset book props of single source.
   *
   * @param sourceId Resetting source id.
   * @param allProps New all props.
   */
  async resetBookPropsOfSource(
    sourceId: SourceId,
    allProps: BookProps[]
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const sidStr = sourceIdToStr(sourceId);
    const props = allProps.filter((p) => sourceIdToStr(p.id.source) === sidStr);

    const f = async (s: Transaction) => {
      const table = bookPropsTable(s);
      await table.where("sourceIdStr").equals(sidStr).delete();
      await table.bulkAdd(props.map(thingToRecord));
      return ok(undefined);
    };

    try {
      const r = await this.db.transaction("rw", this.db.bookProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadAllBookProps(): Promise<
    Result<BookRecord<BookProps>, LocalRepositoryConnectionError>
  > {
    const f = async (s: Transaction) => {
      const table = bookPropsTable(s);
      const records = await table.toArray();
      const props = records.map(bookPropsRecordToOriginal);
      return ok(Object.fromEntries(props.map((p) => [bookIdToStr(p.id), p])));
    };

    try {
      const r = await this.db.transaction("r", this.db.bookProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadBookProps(
    id: BookId
  ): Promise<Result<BookProps, LocalRepositoryBookError>> {
    const idStr = bookIdToStr(id);
    const f = async (s: Transaction) => {
      const table = bookPropsTable(s);
      const rec = await table.where("idStr").equals(idStr).first();
      if (rec === undefined)
        return err(bookNotExistsInLocalRepositoryError(id));

      return ok(bookPropsRecordToOriginal(rec));
    };

    try {
      const r = await this.db.transaction("r", this.db.bookProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async storeMultipleBookProps(
    props: BookRecord<BookProps>
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const f = async (s: Transaction) => {
      const table = bookPropsTable(s);
      await table.bulkPut(Object.values(props).map(thingToRecord));
      return ok(undefined);
    };

    try {
      const r = await this.db.transaction("rw", this.db.bookProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadAllContentProps(): Promise<
    Result<BookRecord<BookContentProps>, LocalRepositoryConnectionError>
  > {
    const f = async (s: Transaction) => {
      const table = bookContentProps(s);
      const records = await table.toArray();
      const r = Object.fromEntries(
        records.map((r) => [r.idStr, bookContentPropsRecordToOriginal(r)])
      );
      return ok(r);
    };

    try {
      const r = await this.db.transaction("r", this.db.bookContentProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadContentProps(
    id: BookId
  ): Promise<Result<BookContentProps, LocalRepositoryBookError>> {
    const f = async (s: Transaction) => {
      const table = bookContentProps(s);
      const rec = await table.where("idStr").equals(bookIdToStr(id)).first();
      if (rec === undefined)
        return err(bookNotExistsInLocalRepositoryError(id));
      return ok(bookContentPropsRecordToOriginal(rec));
    };

    try {
      const r = await this.db.transaction("r", this.db.bookContentProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadContentData(
    id: BookId
  ): Promise<Result<DataUri, LocalRepositoryBookError>> {
    const f = async (s: Transaction) => {
      const dataTable = bookContentData(s);
      const partTable = bookContentDataPart(s);
      const contentRec = await dataTable
        .where("idStr")
        .equals(bookIdToStr(id))
        .first();
      if (contentRec === undefined)
        return err(bookNotExistsInLocalRepositoryError(id));
      const parts = await partTable.bulkGet(contentRec.parts);
      if (!arrayIsNotUndefined(parts))
        return err(
          localRepositoryConnectionError("content data part is incorrect")
        );
      const contentData = parts.map((p) => p.dataPart).join("");
      return ok(contentData);
    };

    try {
      const r = await this.db.transaction(
        "r",
        this.db.bookContentData,
        this.db.bookContentDataPart,
        f
      );
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async storeContent(
    props: BookContentProps,
    data: DataUri
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const f = async (s: Transaction) => {
      const propsTable = bookContentProps(s);
      const dataTable = bookContentData(s);
      const dataPartTable = bookContentDataPart(s);
      const idStr = bookIdToStr(props.id);
      const dataParts = splitData(data);
      const dataPartRecords = dataParts.map((p) => ({
        id: uuidv4(),
        bookIdStr: idStr,
        dataPart: p,
      }));
      const dataIds = dataPartRecords.map((r) => r.id);
      await dataPartTable.where("bookIdStr").equals(idStr).delete();
      await Promise.all([
        propsTable.put(thingToRecord(props)),
        dataTable.put({ idStr, parts: dataIds }),
        dataPartTable.bulkPut(dataPartRecords),
      ]);
      return ok(undefined);
    };

    try {
      const r = await this.db.transaction(
        "rw",
        this.db.bookContentProps,
        this.db.bookContentData,
        this.db.bookContentDataPart,
        f
      );
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async deleteContent(
    id: BookId
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const f = async (s: Transaction) => {
      const propsTable = bookContentProps(s);
      const dataTable = bookContentData(s);
      const idStr = bookIdToStr(id);
      await Promise.all([
        propsTable.where("idStr").equals(idStr).delete(),
        dataTable.where("idStr").equals(idStr).delete(),
      ]);
      return ok(undefined);
    };

    try {
      const r = await this.db.transaction(
        "rw",
        this.db.bookContentProps,
        this.db.bookContentData,
        f
      );
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadAllThumbnailProps(): Promise<
    Result<BookRecord<BookThumbnailProps>, LocalRepositoryConnectionError>
  > {
    const f = async (s: Transaction) => {
      const table = bookThumbnailProps(s);
      const records = await table.toArray();
      const r = Object.fromEntries(
        records.map((r) => [r.idStr, bookThumbnailPropsRecordToOriginal(r)])
      );
      return ok(r);
    };

    try {
      const r = await this.db.transaction("r", this.db.bookThumbnailProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadThumbnailProps(
    id: BookId
  ): Promise<Result<BookThumbnailProps, LocalRepositoryBookError>> {
    const f = async (s: Transaction) => {
      const table = bookThumbnailProps(s);
      const rec = await table.where("idStr").equals(bookIdToStr(id)).first();
      if (rec === undefined)
        return err(bookNotExistsInLocalRepositoryError(id));
      return ok(bookThumbnailPropsRecordToOriginal(rec));
    };

    try {
      const r = await this.db.transaction("r", this.db.bookThumbnailProps, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async loadThumbnailData(
    id: BookId
  ): Promise<Result<DataUri, LocalRepositoryBookError>> {
    const f = async (s: Transaction) => {
      const table = bookThumbnailData(s);
      const rec = await table.where("idStr").equals(bookIdToStr(id)).first();
      if (rec === undefined)
        return err(bookNotExistsInLocalRepositoryError(id));
      return ok(rec.data);
    };

    try {
      const r = await this.db.transaction("r", this.db.bookThumbnailData, f);
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async storeThumbnail(
    props: BookThumbnailProps,
    data: DataUri
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const f = async (s: Transaction) => {
      const propsTable = bookThumbnailProps(s);
      const dataTable = bookThumbnailData(s);
      const idStr = bookIdToStr(props.id);
      await Promise.all([
        propsTable.put(thingToRecord(props)),
        dataTable.put({ idStr, data }),
      ]);
      return ok(undefined);
    };

    try {
      const r = await this.db.transaction(
        "rw",
        this.db.bookThumbnailProps,
        this.db.bookThumbnailData,
        f
      );
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }

  async deleteThumbnail(
    id: BookId
  ): Promise<Result<void, LocalRepositoryConnectionError>> {
    const f = async (s: Transaction) => {
      const propsTable = bookThumbnailProps(s);
      const dataTable = bookThumbnailData(s);
      const idStr = bookIdToStr(id);
      await Promise.all([
        propsTable.where("idStr").equals(idStr).delete(),
        dataTable.where("idStr").equals(idStr).delete(),
      ]);
      return ok(undefined);
    };

    try {
      const r = await this.db.transaction(
        "rw",
        this.db.bookThumbnailProps,
        this.db.bookThumbnailData,
        f
      );
      return r;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown dexie error";
      return err(localRepositoryConnectionError(message));
    }
  }
}
