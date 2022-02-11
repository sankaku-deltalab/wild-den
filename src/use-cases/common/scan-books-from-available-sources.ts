import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  BookRecord,
  LocalRepositoryConnectionError,
  OnlineSourceError,
  SourceId,
} from "../../core";
import { LocalBookRepository } from "../../core/interfaces";
import { Result, ok, isOk } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";
import {
  BookSourceFactory,
  OnlineBookDataRepositoryFactory,
} from "./interfaces";
import { scanBookOnSingleSource } from ".";

type ScanBooksFromSingleSourceType = () => Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
>;

/**
 * Scan books from available all book sources and store them.
 *
 * 1. Scan books from book source.
 * 2. Update book props
 * 3. Store book props to local repository and online repository.
 */
export interface ScanBooksFromAvailableSources
  extends FunctionClass<ScanBooksFromSingleSourceType> {}

@singleton()
@injectable()
export class ScanBooksFromAvailableSourcesImpl
  implements ScanBooksFromAvailableSources
{
  constructor(
    @inject(it.DateUtil) private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository,
    @inject(it.OnlineBookDataRepositoryFactory)
    private readonly onlineBookRepoFactory: OnlineBookDataRepositoryFactory,
    @inject(it.BookSourceFactory)
    private readonly bookSourceFactory: BookSourceFactory
  ) {}

  async run() {
    const sources = await this.bookSourceFactory.getAllAvailableBookSources();

    const booksArray = await Promise.all(
      Object.values(sources).map((s) =>
        scanBookOnSingleSource(
          s,
          this.date,
          this.onlineBookRepoFactory,
          this.localRepo
        )
      )
    );
    const booksArrayVal = booksArray.filter(isOk).map((v) => v.val);
    const books: BookRecord<BookProps> = Object.assign({}, ...booksArrayVal);
    return ok(books);
  }
}
