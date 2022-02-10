import { Result } from "../../../results";
import {
  OnlineBookDataRepository,
  OnlineSourceError,
  SourceId,
} from "../../../core";

export interface OnlineBookDataRepositoryFactory {
  getRepository(
    sourceId: SourceId
  ): Promise<Result<OnlineBookDataRepository, OnlineSourceError>>;
}
