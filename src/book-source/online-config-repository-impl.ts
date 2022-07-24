import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../inject-tokens";
import { err, Result } from "../results";
import { OnlineSourceError, SourceId, sourceNotAvailableError } from "../core";
import type {
  BookSourceConfig,
  OnlineConfigRepository,
} from "../core/interfaces";
import type { OneDriveOnlineConfigRepository } from "./interfaces";

@singleton()
@injectable()
export class OnlineConfigRepositoryImpl implements OnlineConfigRepository {
  constructor(
    @inject(it.OneDriveOnlineConfigRepository)
    private readonly oneDriveOnlineConfigRepository: OneDriveOnlineConfigRepository
  ) {}

  async loadConfig(
    source: SourceId
  ): Promise<Result<BookSourceConfig, OnlineSourceError>> {
    if (source.sourceType === "OneDrive")
      return await this.oneDriveOnlineConfigRepository.loadConfig(source);
    return err(sourceNotAvailableError(source));
  }

  async storeConfig(
    source: SourceId,
    config: BookSourceConfig
  ): Promise<Result<void, OnlineSourceError>> {
    if (source.sourceType === "OneDrive")
      return await this.oneDriveOnlineConfigRepository.storeConfig(
        source,
        config
      );
    return err(sourceNotAvailableError(source));
  }
}
