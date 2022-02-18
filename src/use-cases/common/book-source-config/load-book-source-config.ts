import { inject, injectable, singleton } from "tsyringe";
import { Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import { DirectoryId, SourceId, OnlineSourceError } from "../../../core";
import {
  BookSourceConfig,
  OnlineConfigRepository,
} from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";

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
    @inject(it.OnlineConfigRepository)
    private readonly onlineConfigRepository: OnlineConfigRepository
  ) {}

  async run(sourceId: SourceId) {
    return await this.onlineConfigRepository.loadConfig(sourceId);
  }
}
