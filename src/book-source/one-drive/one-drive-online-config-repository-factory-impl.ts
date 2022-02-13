import { inject, injectable, singleton } from "tsyringe";
import { Result, ok } from "../../results";
import { injectTokens as it } from "../../inject-tokens";
import { OnlineSourceError, SourceId } from "../../core";
import { OnlineBookSourceConfigRepository } from "../../core/interfaces";
import { OneDriveOnlineConfigRepositoryFactory } from "../interfaces";
import { OneDriveOnlineConfigRepositoryMock } from "./one-drive-online-config-repository-mock";
import { DateUtil } from "../../util";
import { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";

@singleton()
@injectable()
export class OneDriveOnlineConfigRepositoryFactoryImpl
  implements OneDriveOnlineConfigRepositoryFactory
{
  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil
  ) {}

  async getRepository(
    sourceId: SourceId
  ): Promise<
    Result<
      OnlineBookSourceConfigRepository<OneDriveDirectoryId>,
      OnlineSourceError
    >
  > {
    const repo = new OneDriveOnlineConfigRepositoryMock(sourceId, this.date);
    return ok(repo);
  }
}
