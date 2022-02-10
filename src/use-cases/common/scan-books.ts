import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  BookRecord,
  LocalBookRepository,
  LocalRepositoryConnectionError,
  OnlineSourceError,
  SourceId,
} from "../../core";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";
import {
  BookSourceFactory,
  OnlineBookDataRepositoryFactory,
} from "./interfaces";

type ScanBookType = (
  sourceId: SourceId
) => Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
>;

/**
 * Scan books from book source and store them.
 *
 * 1. Scan books from book source.
 * 2. Update book props
 * 3. Store book props to local repository and online repository.
 */
export interface ScanBooks extends FunctionClass<ScanBookType> {}

@singleton()
@injectable()
export class ScanBooksImpl implements ScanBooks {
  constructor(
    @inject(it.DateUtil) private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository,
    @inject(it.OnlineBookDataRepositoryFactory)
    private readonly onlineBookRepoFactory: OnlineBookDataRepositoryFactory,
    @inject(it.BookSourceFactory)
    private readonly bookSourceFactory: BookSourceFactory
  ) {}

  async run(sourceId: SourceId) {
    const [source, onlineDataRepo] = await Promise.all([
      this.bookSourceFactory.getBookSource(sourceId),
      this.onlineBookRepoFactory.getRepository(sourceId),
    ]);

    if (source.err) return source;
    if (onlineDataRepo.err) return onlineDataRepo;

    const [onlineFiles, localProps] = await Promise.all([
      source.val.scanAllFiles(),
      this.localRepo.loadAllBookProps(),
    ]);
    if (onlineFiles.err) return onlineFiles;
    if (localProps.err) return localProps;

    // TODO: merge file (impl at core)
    const now = this.date.now();
    const books = localProps.val;

    const store = await onlineDataRepo.val.storeBookProps(books);
    if (store.err) return store;

    return ok(books);
  }
}
