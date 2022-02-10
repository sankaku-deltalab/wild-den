import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  LocalBookRepository,
  BookId,
  BookThumbnailProps,
  LocalRepositoryBookError,
} from "../../../core";
import { injectTokens as it } from "../../../inject-tokens";
import { DateUtil } from "../../../util";

type LoadLocalBookThumbnailPropsType = (
  id: BookId
) => Promise<Result<BookThumbnailProps, LocalRepositoryBookError>>;

/**
 * Load book thumbnail props from local repository.
 * Used for user want to know "Is this book thumbnail is loaded?".
 */
export interface LoadLocalBookThumbnailProps
  extends FunctionClass<LoadLocalBookThumbnailPropsType> {}

@singleton()
@injectable()
export class LoadLocalBookThumbnailPropsImpl
  implements LoadLocalBookThumbnailProps
{
  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(id: BookId) {
    return await this.localRepo.loadThumbnailProps(id);
  }
}
