import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  BookRecord,
  filePropsToBookProps,
  LocalRepositoryConnectionError,
  OnlineSourceError,
  SourceId,
} from "../../core";
import {
  BookSource,
  LocalBookRepository,
  OnlineBookDataRepository,
} from "../../core/interfaces";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil, mapObj } from "../../util";
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
  onlineBookRepository: OnlineBookDataRepository,
  localRepo: LocalBookRepository
): Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
> => {
  const [onlineFiles, localProps] = await Promise.all([
    bookSource.scanAllFiles(sourceId),
    localRepo.loadAllBookProps(),
  ]);
  if (onlineFiles.err) return onlineFiles;
  if (localProps.err) return localProps;

  // TODO: merge file (impl at core)
  const now = date.now();
  const books = mapObj(onlineFiles.val, (key, f) =>
    filePropsToBookProps(now, f)
  );

  const [storeOnline, storeLocal] = await Promise.all([
    onlineBookRepository.resetBookPropsOfSource(sourceId, books),
    localRepo.resetBookPropsOfSource(sourceId, Object.values(books)),
  ]);
  if (storeOnline.err) return storeOnline;
  if (storeLocal.err) return storeLocal;
  return ok(books);
};
