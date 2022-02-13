import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../inject-tokens";
import { Result } from "../results";
import { DirectoryId, OnlineSourceError, SourceId } from "../core";
import { OnlineBookSourceConfigRepository } from "../core/interfaces";
import { OnlineConfigRepositoryFactory } from "../use-cases/common/interfaces";
import { OneDriveOnlineConfigRepositoryFactory } from "./interfaces";

@singleton()
@injectable()
export class OnlineConfigRepositoryFactoryImpl
  implements OnlineConfigRepositoryFactory
{
  constructor(
    @inject(it.OneDriveOnlineConfigRepositoryFactory)
    private readonly oneDrive: OneDriveOnlineConfigRepositoryFactory
  ) {}

  async getRepository<DirId extends DirectoryId>(
    sourceId: SourceId
  ): Promise<
    Result<OnlineBookSourceConfigRepository<DirId>, OnlineSourceError>
  > {
    return await this.oneDrive.getRepository(sourceId);
  }
}
