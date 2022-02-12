import { inject, injectable, singleton } from "tsyringe";
import { Result, ok, err, isOk } from "../../results";
import { injectTokens as it } from "../../inject-tokens";
import {
  OnlineSourceError,
  SourceId,
  SourceIdStr,
  sourceIdStrToId,
  sourceIdToStr,
  sourceNotAvailableError,
} from "../../core";
import { BookSource } from "../../core/interfaces";
import { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";
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
    const wrappers = this.clientWrapperFactory.getClientWrappers(msalInstance);

    const sidStr = sourceIdToStr(sourceId);
    if (!(sidStr in wrappers)) return err(sourceNotAvailableError(sourceId));

    return await this.getSource(sourceId, wrappers[sidStr]);
  }

  private async getSource(
    sourceId: SourceId,
    client: MsGraphClientWrapper
  ): Promise<Result<OneDriveBookSource, OnlineSourceError>> {
    const configRepo =
      await this.configRepository.getRepository<OneDriveDirectoryId>(sourceId);
    if (configRepo.err) return configRepo;

    return ok(
      new OneDriveBookSource(sourceId, client, this.clientUtil, configRepo.val)
    );
  }
}
