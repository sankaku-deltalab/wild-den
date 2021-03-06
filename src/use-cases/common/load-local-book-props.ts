import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../results";
import type { FunctionClass } from "../../function-class";
import type {
  BookRecord,
  BookProps,
  LocalRepositoryConnectionError,
} from "../../core";
import type { LocalBookRepository } from "../../core/interfaces";
import { injectTokens as it } from "../../inject-tokens";

type LoadLocalBookPropsType = () => Promise<
  Result<BookRecord<BookProps>, LocalRepositoryConnectionError>
>;

/**
 * Load book props from local repository.
 * Loaded props would be used for view.
 */
export interface LoadLocalBookProps
  extends FunctionClass<LoadLocalBookPropsType> {}

@singleton()
@injectable()
export class LoadLocalBookPropsImpl implements LoadLocalBookProps {
  constructor(
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run() {
    return await this.localRepo.loadAllBookProps();
  }
}
