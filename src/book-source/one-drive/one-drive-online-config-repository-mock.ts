import { Result, ok } from "../../results";
import { CommonOnlineError, SourceId } from "../../core";
import {
  BookSourceConfig,
  OnlineBookSourceConfigRepository,
} from "../../core/interfaces";
import { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";
import { DateUtil } from "../../util";

export class OneDriveOnlineConfigRepositoryMock
  implements OnlineBookSourceConfigRepository<OneDriveDirectoryId>
{
  private config: BookSourceConfig<OneDriveDirectoryId>;

  constructor(
    private readonly sourceId: SourceId,
    private readonly date: DateUtil
  ) {
    this.config = {
      lastModifiedDate: this.date.now(),
      targetRootDirectories: [],
      ignoreFolderNames: [],
    };
  }

  getSourceId(): SourceId {
    return this.sourceId;
  }

  async loadConfig(): Promise<
    Result<BookSourceConfig<OneDriveDirectoryId>, CommonOnlineError>
  > {
    return ok(this.config);
  }

  async storeConfig(
    config: BookSourceConfig<OneDriveDirectoryId>
  ): Promise<Result<void, CommonOnlineError>> {
    this.config = config;
    return ok(undefined);
  }
}
