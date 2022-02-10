import { inject, injectable, singleton } from "tsyringe";
import {
  BookIdStr,
  BookProps,
  BookSource,
  CommonOnlineError,
  LocalBookRepository,
  LocalRepositoryConnectionError,
  OnlineBookDataRepository,
  DirectoryId,
  bookIdToStr,
} from "../../core";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";

type UpdateBookPropsType = (
  onlineRepository: OnlineBookDataRepository<DirectoryId>,
  newBookProps: BookProps
) => Promise<
  Result<
    Record<BookIdStr, BookProps>,
    CommonOnlineError | LocalRepositoryConnectionError
  >
>;

/**
 * Update book props and store it.
 */
export interface UpdateBookProps extends FunctionClass<UpdateBookPropsType> {}

@singleton()
@injectable()
export class UpdateBookPropsImpl implements UpdateBookProps {
  constructor(
    @inject(it.DateUtil) private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(
    onlineRepository: OnlineBookDataRepository<DirectoryId>,
    newBookProps: BookProps
  ) {
    const newBookPropsObj = {
      [bookIdToStr(newBookProps.id)]: newBookProps,
    };

    const [onlineProps, localProps] = await Promise.all([
      onlineRepository.loadBookProps(),
      this.localRepo.loadAllBookProps(),
    ]);
    if (onlineProps.err) return onlineProps;
    if (localProps.err) return localProps;

    const updatedLocalProps = Object.assign({}, localProps, newBookPropsObj);
    const [r1, r2] = await Promise.all([
      onlineRepository.storeBookProps(
        Object.assign({}, onlineProps, newBookPropsObj)
      ),
      this.localRepo.storeAllBookProps(updatedLocalProps),
    ]);

    if (r1.err) return r1;
    if (r2.err) return r2;

    return ok(updatedLocalProps);
  }
}
