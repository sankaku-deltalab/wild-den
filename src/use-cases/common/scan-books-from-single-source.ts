import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  BookRecord,
  LocalRepositoryConnectionError,
  OnlineSourceError,
  SourceId,
} from "../../core";
import { BookSource, LocalBookRepository } from "../../core/interfaces";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";
import {
  BookSourceFactory,
  OnlineBookDataRepositoryFactory,
} from "./interfaces";

type ScanBooksFromSingleSourceType = (
  sourceId: SourceId
) => Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
>;

/**
 * Scan books from single book source and store them.
 *
 * 1. Scan books from book source.
 * 2. Update book props
 * 3. Store book props to local repository and online repository.
 */
export interface ScanBooksFromSingleSource
  extends FunctionClass<ScanBooksFromSingleSourceType> {}

@singleton()
@injectable()
export class ScanBooksFromSingleSourceImpl
  implements ScanBooksFromSingleSource
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

  async run(sourceId: SourceId) {
    return scanBookOnSingleSource(
      sourceId,
      this.date,
      this.bookSourceFactory,
      this.onlineBookRepoFactory,
      this.localRepo
    );
  }
}

export const scanBookOnSingleSource = async (
  sourceId: SourceId,
  date: DateUtil,
  bookSourceFactory: BookSourceFactory,
  onlineBookRepoFactory: OnlineBookDataRepositoryFactory,
  localRepo: LocalBookRepository
): Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
> => {
  const source = await bookSourceFactory.getBookSource(sourceId);
  if (source.err) return source;

  const onlineDataRepo = await onlineBookRepoFactory.getRepository(sourceId);
  if (onlineDataRepo.err) return onlineDataRepo;

  const [onlineFiles, localProps] = await Promise.all([
    source.val.scanAllFiles(),
    localRepo.loadAllBookProps(),
  ]);
  if (onlineFiles.err) return onlineFiles;
  if (localProps.err) return localProps;

  // TODO: merge file (impl at core)
  const now = date.now();
  const books = localProps.val;

  const [storeOnline, storeLocal] = await Promise.all([
    onlineDataRepo.val.storeBookProps(books),
    localRepo.resetBookPropsOfSource(sourceId, Object.values(books)),
  ]);
  if (storeOnline.err) return storeOnline;
  if (storeLocal.err) return storeLocal;
  return ok(books);
};
