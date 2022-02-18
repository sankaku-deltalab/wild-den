import { inject, injectable, singleton } from "tsyringe";
import {
  BookIdStr,
  BookProps,
  LocalRepositoryConnectionError,
  OnlineSourceError,
  SourceId,
} from "../../core";
import {
  LocalBookRepository,
  OnlineBookDataRepository,
} from "../../core/interfaces";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";

type SyncBookPropsType = (
  sourceId: SourceId
) => Promise<
  Result<
    Record<BookIdStr, BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
  >
>;

/**
 * Sync book props in local and online repository.
 *
 * 1. Load book props from online repository.
 * 2. Load book props from local repository.
 * 3. Merge book props.
 * 4. Store book props to online and local repository.
 */
export interface SyncBookProps extends FunctionClass<SyncBookPropsType> {}

@singleton()
@injectable()
export class SyncBookPropsImpl implements SyncBookProps {
  constructor(
    @inject(it.DateUtil) private readonly date: DateUtil,
    @inject(it.OnlineBookDataRepository)
    private readonly onlineBookRepository: OnlineBookDataRepository,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(sourceId: SourceId) {
    const [onlineProps, localProps] = await Promise.all([
      this.onlineBookRepository.loadStoredBookProps(sourceId),
      this.localRepo.loadAllBookProps(),
    ]);
    if (onlineProps.err) return onlineProps;
    if (localProps.err) return localProps;

    // TODO: merge props (impl at core)
    const now = this.date.now();
    const books = Object.assign({}, localProps.val, onlineProps.val);

    return ok(books);
  }
}
