import { inject, injectable, singleton } from "tsyringe";
import type { FunctionClass } from "../../../function-class";
import { injectTokens as it } from "../../../inject-tokens";
import { BookSourceFactory } from "../../common";
import type { MsalInstanceType } from "./types";
import type { OneDriveConfigRepository } from "./one-drive-config-repository";
import { MsalInstanceRepository } from "./msal-instance-repository";

type GetOneDriveBookSourcesFactoryType = () => BookSourceFactory;

export interface GetOneDriveBookSourcesFactory
  extends FunctionClass<GetOneDriveBookSourcesFactoryType> {}

@singleton()
@injectable()
export class GetOneDriveBookSourcesFactoryImpl
  implements GetOneDriveBookSourcesFactory
{
  constructor(
    @inject(it.OneDriveBookSourcesFactoryRaw)
    private readonly sourcesFactory: GetOneDriveBookSourcesFactoryRaw,
    @inject(it.MsalInstanceRepository)
    private readonly msalRepo: MsalInstanceRepository,
    @inject(it.OneDriveConfigRepository)
    private readonly configRepo: OneDriveConfigRepository
  ) {}

  run(): BookSourceFactory {
    const msalInstance = this.msalRepo.get();
    return new OneDriveBookSourcesFactory(
      msalInstance,
      this.sourcesFactory,
      this.configRepo
    );
  }
}

/**
 * Not injectable.
 * Constructed by `GetOneDriveBookSourcesFactoryImpl`.
 */
class OneDriveBookSourcesFactory implements BookSourceFactory {
  constructor(
    private readonly msalInstance: MsalInstanceType,
    private readonly sourcesFactoryRaw: GetOneDriveBookSourcesFactoryRaw,
    private readonly configRepository: OneDriveConfigRepository
  ) {}

  getAvailableBookSources(): ReturnType<
    BookSourceFactory["getAvailableBookSources"]
  > {
    return this.sourcesFactoryRaw.getAvailableBookSources(
      this.msalInstance,
      this.configRepository
    );
  }
}

export interface GetOneDriveBookSourcesFactoryRaw {
  getAvailableBookSources(
    msalInstance: MsalInstanceType,
    configRepository: OneDriveConfigRepository
  ): ReturnType<BookSourceFactory["getAvailableBookSources"]>;
}
