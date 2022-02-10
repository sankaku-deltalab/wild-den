import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import { DirectoryId, SourceId, OnlineSourceError } from "../../../core";
import { BookSourceConfig } from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";
import { OnlineConfigRepositoryFactory } from "../interfaces";

type StoreBookSourceConfigType = <DirId extends DirectoryId>(
  sourceId: SourceId,
  config: BookSourceConfig<DirId>
) => Promise<Result<void, OnlineSourceError>>;

/**
 * Store book source config.
 */
export interface StoreBookSourceConfig
  extends FunctionClass<StoreBookSourceConfigType> {}

@singleton()
@injectable()
export class StoreBookSourceConfigImpl implements StoreBookSourceConfig {
  constructor(
    @inject(it.OnlineConfigRepositoryFactory)
    private readonly onlineConfigRepositoryFactory: OnlineConfigRepositoryFactory
  ) {}

  async run<DirId extends DirectoryId>(
    sourceId: SourceId,
    config: BookSourceConfig<DirId>
  ) {
    const configRepo = await this.onlineConfigRepositoryFactory.getRepository(
      sourceId
    );
    if (configRepo.err) return configRepo;

    return await configRepo.val.storeConfig(config);
  }
}
