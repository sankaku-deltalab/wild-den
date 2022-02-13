import { inject, injectable, singleton } from "tsyringe";
import { Result, ok } from "../../results";
import { injectTokens as it } from "../../inject-tokens";
import { OnlineSourceError, SourceId } from "../../core";
import { BookSource } from "../../core/interfaces";
import { MsGraphClientUtil } from "./interfaces/ms-graph-client-util";
import {
  OneDriveBookSourceFactory,
  OneDriveOnlineConfigRepositoryFactory,
} from "../interfaces";
import {
  MsGraphClientWrapper,
  MsGraphClientWrapperFactory,
} from "./interfaces";
import { MsalInstanceRepository } from "../../use-cases/book-sources/one-drive/interfaces";
import { OneDriveBookSource } from "./one-drive-book-source";
import { msalInstanceAccountToSourceId } from "./util";

@singleton()
@injectable()
export class OneDriveBookSourceFactoryImpl
  implements OneDriveBookSourceFactory
{
  constructor(
    @inject(it.MsGraphClientWrapperFactory)
    private readonly clientWrapperFactory: MsGraphClientWrapperFactory,
    @inject(it.MsalInstanceRepository)
    private readonly msalInstanceRepository: MsalInstanceRepository,
    @inject(it.OneDriveOnlineConfigRepositoryFactory)
    private readonly configRepository: OneDriveOnlineConfigRepositoryFactory,
    @inject(it.MsGraphClientUtil)
    private readonly clientUtil: MsGraphClientUtil
  ) {}

  async getAllAvailableBookSourceIds(): Promise<SourceId[]> {
    const msalInstance = this.msalInstanceRepository.get();
    return msalInstance
      .getAllAccounts()
      .map((a) => msalInstanceAccountToSourceId(a));
  }

  async getBookSource(
    sourceId: SourceId
  ): Promise<Result<BookSource, OnlineSourceError>> {
    const msalInstance = this.msalInstanceRepository.get();
    const wrapper = this.clientWrapperFactory.getClientWrapper(
      sourceId,
      msalInstance
    );
    if (wrapper.err) return wrapper;

    return await this.getSource(sourceId, wrapper.val);
  }

  private async getSource(
    sourceId: SourceId,
    client: MsGraphClientWrapper
  ): Promise<Result<OneDriveBookSource, OnlineSourceError>> {
    const configRepo = await this.configRepository.getRepository(sourceId);
    if (configRepo.err) return configRepo;

    return ok(
      new OneDriveBookSource(sourceId, client, this.clientUtil, configRepo.val)
    );
  }
}
