import { inject, injectable, singleton } from "tsyringe";
import { LocalRepositoryBookError } from "../../core";
import { LocalBookRepository } from "../../core/interfaces";
import { Result } from "../../results";
import type { FunctionClass } from "../../function-class";
import { injectTokens as it } from "../../inject-tokens";

type ClearLocalRepositoryType = () => Promise<
  Result<void, LocalRepositoryBookError>
>;

export interface ClearLocalRepository
  extends FunctionClass<ClearLocalRepositoryType> {}

@singleton()
@injectable()
export class ClearLocalRepositoryImpl implements ClearLocalRepository {
  constructor(
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run() {
    return this.localRepo.clean();
  }
}
