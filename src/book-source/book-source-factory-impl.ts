import { inject, injectable, singleton } from "tsyringe";
import {
  OnlineSourceError,
  SourceId,
  SourceIdStr,
  sourceNotAvailableError,
} from "../core";
import { BookSource } from "../core/interfaces";
import { injectTokens as it } from "../inject-tokens";
import { err, Result } from "../results";
import { BookSourceFactory } from "../use-cases/common/interfaces";
import { OneDriveBookSourceFactory } from "./interfaces";

@singleton()
@injectable()
export class BookSourceFactoryImpl implements BookSourceFactory {
  constructor(
    @inject(it.OneDriveBookSourceFactory)
    private readonly oneDriveSourceFactory: OneDriveBookSourceFactory
  ) {}

  async getAllAvailableBookSources(): Promise<Record<SourceIdStr, BookSource>> {
    return await this.oneDriveSourceFactory.getAllAvailableBookSources();
  }

  async getBookSource(
    sourceId: SourceId
  ): Promise<Result<BookSource, OnlineSourceError>> {
    if (sourceId.sourceType === "OneDrive")
      return await this.oneDriveSourceFactory.getBookSource(sourceId);

    return err(sourceNotAvailableError(sourceId));
  }
}
