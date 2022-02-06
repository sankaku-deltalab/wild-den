import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  LocalBookRepository,
  LocalRepositoryConnectionError,
  BookId,
} from "../../../core";
import { injectTokens as it } from "../../../inject-tokens";

type DeleteBookThumbnailFromLocalType = (
  id: BookId
) => Promise<Result<void, LocalRepositoryConnectionError>>;

/**
 * Delete book thumbnail from local repository.
 */
export interface DeleteBookThumbnailFromLocal
  extends FunctionClass<DeleteBookThumbnailFromLocalType> {}

@singleton()
@injectable()
export class DeleteBookThumbnailFromLocalImpl
  implements DeleteBookThumbnailFromLocal
{
  constructor(
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(id: BookId) {
    return await this.localRepo.deleteThumbnail(id);
  }
}
