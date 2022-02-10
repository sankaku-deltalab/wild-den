import { Result } from "../../../results";
import { OnlineSourceError, SourceId } from "../../../core";
import { OnlineBookDataRepository } from "../../../core/interfaces";

export interface OnlineBookDataRepositoryFactory {
  getRepository(
    sourceId: SourceId
  ): Promise<Result<OnlineBookDataRepository, OnlineSourceError>>;
}
