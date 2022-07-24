import { Result, ok } from "../../results";
import { injectTokens as it } from "../../inject-tokens";
import type { CommonOnlineError, SourceId } from "../../core";
import type {
  BookSourceConfig,
  OnlineConfigRepository,
} from "../../core/interfaces";
import type { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";
import type { DateUtil } from "../../util";
import { inject, injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class OneDriveOnlineConfigRepositoryMock
  implements OnlineConfigRepository
{
  private config: BookSourceConfig<OneDriveDirectoryId>;

  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil
  ) {
    this.config = {
      lastModifiedDate: this.date.now(),
      targetRootDirectories: [],
      ignoreFolderNames: [],
    };
  }

  async loadConfig(
    source: SourceId
  ): Promise<Result<BookSourceConfig<OneDriveDirectoryId>, CommonOnlineError>> {
    return ok(this.config);
  }

  async storeConfig(
    source: SourceId,
    config: BookSourceConfig<OneDriveDirectoryId>
  ): Promise<Result<void, CommonOnlineError>> {
    this.config = config;
    return ok(undefined);
  }
}
