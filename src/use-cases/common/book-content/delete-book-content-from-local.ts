import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import { LocalRepositoryConnectionError, BookId } from "../../../core";
import type { LocalBookRepository } from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";

type DeleteBookContentFromLocalType = (
  id: BookId
) => Promise<Result<void, LocalRepositoryConnectionError>>;

/**
 * Delete book content from local repository.
 */
export interface DeleteBookContentFromLocal
  extends FunctionClass<DeleteBookContentFromLocalType> {}

@singleton()
@injectable()
export class DeleteBookContentFromLocalImpl
  implements DeleteBookContentFromLocal
{
  constructor(
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(id: BookId) {
    return await this.localRepo.deleteContent(id);
  }
}
