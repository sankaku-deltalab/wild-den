import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  BookRecord,
  LocalRepositoryConnectionError,
  OnlineSourceError,
} from "../../core";
import { BookSource, LocalBookRepository } from "../../core/interfaces";
import { Result, ok, isOk } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";
import { OnlineBookDataRepositoryFactory } from "./interfaces";
import { scanBookOnSingleSource } from "./scan-books-from-single-source";

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
    @inject(it.BookSource)
    private readonly bookSource: BookSource
  ) {}

  async run() {
    const sources = await this.bookSource.getAllAvailableBookSourceIds();

    const booksArray = await Promise.all(
      sources.map((s) =>
        scanBookOnSingleSource(
          s,
          this.date,
          this.bookSource,
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
