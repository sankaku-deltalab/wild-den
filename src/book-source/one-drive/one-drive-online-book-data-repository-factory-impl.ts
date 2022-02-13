import { inject, injectable, singleton } from "tsyringe";
import { Result, ok } from "../../results";
import { injectTokens as it } from "../../inject-tokens";
import { OnlineSourceError, SourceId } from "../../core";
import { OnlineBookDataRepository } from "../../core/interfaces";
import { MsGraphClientUtil } from "./interfaces/ms-graph-client-util";
import { OneDriveOnlineBookDataRepositoryFactory } from "../interfaces";
import { MsGraphClientWrapperFactory } from "./interfaces";
import { MsalInstanceRepository } from "../../use-cases/book-sources/one-drive/interfaces";
import { OneDriveOnlineBookDataRepository } from "./one-drive-online-book-data-repository";

@singleton()
@injectable()
export class OneDriveOnlineBookDataRepositoryFactoryImpl
  implements OneDriveOnlineBookDataRepositoryFactory
{
  constructor(
    @inject(it.MsGraphClientWrapperFactory)
    private readonly clientWrapperFactory: MsGraphClientWrapperFactory,
    @inject(it.MsalInstanceRepository)
    private readonly msalInstanceRepository: MsalInstanceRepository,
    @inject(it.MsGraphClientUtil)
    private readonly clientUtil: MsGraphClientUtil
  ) {}

  async getRepository(
    sourceId: SourceId
  ): Promise<Result<OnlineBookDataRepository, OnlineSourceError>> {
    const msalInstance = this.msalInstanceRepository.get();
    const client = this.clientWrapperFactory.getClientWrapper(
      sourceId,
      msalInstance
    );
    if (client.err) return client;

    return ok(
      new OneDriveOnlineBookDataRepository(
        sourceId,
        client.val,
        this.clientUtil
      )
    );
  }
}
