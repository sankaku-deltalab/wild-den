import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  BookSourceConfig,
  DirectoryId,
  SourceId,
  OnlineSourceError,
} from "../../../core";
import { injectTokens as it } from "../../../inject-tokens";
import { OnlineConfigRepositoryFactory } from "../interfaces";

type LoadBookSourceConfigType = <DirId extends DirectoryId>(
  sourceId: SourceId
) => Promise<Result<BookSourceConfig<DirId>, OnlineSourceError>>;

/**
 * Load book source config.
 */
export interface LoadBookSourceConfig
  extends FunctionClass<LoadBookSourceConfigType> {}

@singleton()
@injectable()
export class LoadBookSourceConfigImpl implements LoadBookSourceConfig {
  constructor(
    @inject(it.OnlineConfigRepositoryFactory)
    private readonly onlineConfigRepositoryFactory: OnlineConfigRepositoryFactory
  ) {}

  async run<DirId extends DirectoryId>(sourceId: SourceId) {
    const configRepo =
      await this.onlineConfigRepositoryFactory.getRepository<DirId>(sourceId);
    if (configRepo.err) return configRepo;
    return await configRepo.val.loadConfig();
  }
}
