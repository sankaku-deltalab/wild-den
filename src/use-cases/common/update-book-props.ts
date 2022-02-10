import { inject, injectable, singleton } from "tsyringe";
import {
  BookProps,
  CommonOnlineError,
  LocalBookRepository,
  LocalRepositoryConnectionError,
  bookIdToStr,
  BookRecord,
  OnlineSourceError,
} from "../../core";
import { Result, ok } from "../../results";
import type { FunctionClass } from "../../function-class";
import { DateUtil } from "../../util";
import { injectTokens as it } from "../../inject-tokens";
import { OnlineBookDataRepositoryFactory } from "./interfaces";

type UpdateBookPropsType = (
  newBookProps: BookProps
) => Promise<
  Result<
    BookRecord<BookProps>,
    OnlineSourceError | LocalRepositoryConnectionError
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
    @inject(it.OnlineBookDataRepositoryFactory)
    private readonly onlineBookRepoFactory: OnlineBookDataRepositoryFactory,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(newBookProps: BookProps) {
    const onlineRepository = await this.onlineBookRepoFactory.getRepository(
      newBookProps.id.source
    );
    if (onlineRepository.err) return onlineRepository;

    const newBookPropsObj = {
      [bookIdToStr(newBookProps.id)]: newBookProps,
    };

    const [onlineProps, localProps] = await Promise.all([
      onlineRepository.val.loadStoredBookProps(),
      this.localRepo.loadAllBookProps(),
    ]);
    if (onlineProps.err) return onlineProps;
    if (localProps.err) return localProps;

    const updatedLocalProps = Object.assign({}, localProps, newBookPropsObj);
    const [r1, r2] = await Promise.all([
      onlineRepository.val.storeBookProps(
        Object.assign({}, onlineProps, newBookPropsObj)
      ),
      this.localRepo.storeAllBookProps(updatedLocalProps),
    ]);

    if (r1.err) return r1;
    if (r2.err) return r2;

    return ok(updatedLocalProps);
  }
}
