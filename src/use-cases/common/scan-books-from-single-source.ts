import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  BookRecord,
  LocalRepositoryConnectionError,
  mergeScannedFilesAndLoadedBooks,
  OnlineSourceError,
  SourceId,
} from "../../core";
import type {
  BookSource,
  LocalBookRepository,
  OnlineBookDataRepository,
} from "../../core/interfaces";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import type { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";

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
    @inject(it.OnlineBookDataRepository)
    private readonly onlineBookRepository: OnlineBookDataRepository,
    @inject(it.BookSource)
    private readonly bookSource: BookSource
  ) {}

  async run(sourceId: SourceId) {
    return scanBookOnSingleSource(
      sourceId,
      this.date,
      this.bookSource,
      this.onlineBookRepository,
      this.localRepo
    );
  }
}

export const scanBookOnSingleSource = async (
  sourceId: SourceId,
  date: DateUtil,
  bookSource: BookSource,
  onlineRepo: OnlineBookDataRepository,
  localRepo: LocalBookRepository
): Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
> => {
  const [onlineFiles, localProps, onlineProps] = await Promise.all([
    bookSource.scanAllFiles(sourceId),
    localRepo.loadAllBookProps(),
    onlineRepo.loadAllStoredBookProps(sourceId),
  ]);
  if (onlineFiles.err) return onlineFiles;
  if (localProps.err) return localProps;
  if (onlineProps.err) return onlineProps;

  const now = date.now();
  const {
    mergedProps: books,
    onlinePropsDiff,
    localPropsDiff,
  } = mergeScannedFilesAndLoadedBooks(
    now,
    onlineFiles.val,
    onlineProps.val,
    localProps.val
  );

  const [storeOnline, storeLocal] = await Promise.all([
    onlineRepo.updateBookPropsOfSourceByDiff(sourceId, books, onlinePropsDiff),
    localRepo.resetBookPropsOfSource(sourceId, Object.values(books)),
  ]);
  if (storeOnline.err) return storeOnline;
  if (storeLocal.err) return storeLocal;
  return ok(books);
};
