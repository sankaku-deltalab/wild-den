import { inject, injectable, singleton } from "tsyringe";
import {
  BookIdStr,
  BookProps,
  BookSource,
  CommonOnlineError,
  LocalBookRepository,
  LocalRepositoryConnectionError,
} from "../../core";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";

type ScanBookType = (
  source: BookSource
) => Promise<
  Result<
    Record<BookIdStr, BookProps>,
    CommonOnlineError | LocalRepositoryConnectionError
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
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(source: BookSource) {
    const [onlineFiles, localProps] = await Promise.all([
      source.scanAllFiles(),
      this.localRepo.loadAllBookProps(),
    ]);
    if (onlineFiles.err) return onlineFiles;
    if (localProps.err) return localProps;

    // TODO: merge file (impl at core)
    const now = this.date.now();
    const books = localProps.val;

    return ok(books);
  }
}
