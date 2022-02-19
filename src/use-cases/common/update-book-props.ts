import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  bookIdToStr,
  OnlineBookError,
  LocalRepositoryBookError,
} from "../../core";
import {
  LocalBookRepository,
  OnlineBookDataRepository,
} from "../../core/interfaces";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";

type UpdateBookPropsType = (
  newBookProps: BookProps
) => Promise<Result<BookProps, OnlineBookError | LocalRepositoryBookError>>;

/**
 * Update book props and store it.
 */
export interface UpdateBookProps extends FunctionClass<UpdateBookPropsType> {}

@singleton()
@injectable()
export class UpdateBookPropsImpl implements UpdateBookProps {
  constructor(
    @inject(it.DateUtil) private readonly date: DateUtil,
    @inject(it.OnlineBookDataRepository)
    private readonly onlineBookRepository: OnlineBookDataRepository,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(newBookProps: BookProps) {
    const book = newBookProps.id;
    const props = {
      date: this.date.now(),
      ...newBookProps,
    };

    const [onlineProps, localProps] = await Promise.all([
      this.onlineBookRepository.loadStoredBookProps(book),
      this.localRepo.loadBookProps(book),
    ]);
    if (onlineProps.err) return onlineProps;
    if (localProps.err) return localProps;

    const [r1, r2] = await Promise.all([
      this.onlineBookRepository.storeBookProps(props),
      this.localRepo.storeMultipleBookProps({
        [bookIdToStr(book)]: props,
      }),
    ]);

    if (r1.err) return r1;
    if (r2.err) return r2;

    return ok(props);
  }
}
