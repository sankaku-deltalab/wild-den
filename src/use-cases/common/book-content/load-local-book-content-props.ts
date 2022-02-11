import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  BookId,
  BookContentProps,
  LocalRepositoryBookError,
} from "../../../core";
import { LocalBookRepository } from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";
import { DateUtil } from "../../../util";

type LoadLocalBookContentPropsType = (
  id: BookId
) => Promise<Result<BookContentProps, LocalRepositoryBookError>>;

/**
 * Load book content props from local repository.
 * Used for user want to know "Is this book content is loaded?".
 */
export interface LoadLocalBookContentProps
  extends FunctionClass<LoadLocalBookContentPropsType> {}

@singleton()
@injectable()
export class LoadLocalBookContentPropsImpl
  implements LoadLocalBookContentProps
{
  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(id: BookId) {
    return await this.localRepo.loadContentProps(id);
  }
}
