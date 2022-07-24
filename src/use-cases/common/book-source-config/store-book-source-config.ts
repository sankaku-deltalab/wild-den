import { inject, injectable, singleton } from "tsyringe";
import type { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import type { DirectoryId, SourceId, OnlineSourceError } from "../../../core";
import type {
  BookSourceConfig,
  OnlineConfigRepository,
} from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";

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
    @inject(it.OnlineConfigRepository)
    private readonly onlineConfigRepository: OnlineConfigRepository
  ) {}

  async run<DirId extends DirectoryId>(
    sourceId: SourceId,
    config: BookSourceConfig<DirId>
  ) {
    return await this.onlineConfigRepository.storeConfig(sourceId, config);
  }
}
