import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../inject-tokens";
import { Result } from "../results";
import { OnlineSourceError, SourceId } from "../core";
import { OnlineBookDataRepository } from "../core/interfaces";
import { OnlineBookDataRepositoryFactory } from "../use-cases/common/interfaces";
import { OneDriveOnlineBookDataRepositoryFactory } from "./interfaces";

@singleton()
@injectable()
export class OnlineBookDataRepositoryFactoryImpl
  implements OnlineBookDataRepositoryFactory
{
  constructor(
    @inject(it.OneDriveOnlineBookDataRepository)
    private readonly oneDrive: OneDriveOnlineBookDataRepositoryFactory
  ) {}

  async getRepository(
    sourceId: SourceId
  ): Promise<Result<OnlineBookDataRepository, OnlineSourceError>> {
    return await this.oneDrive.getRepository(sourceId);
  }
}
