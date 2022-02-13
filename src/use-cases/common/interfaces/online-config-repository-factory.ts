import { Result } from "../../../results";
import { SourceId, DirectoryId, OnlineSourceError } from "../../../core";
import { OnlineBookSourceConfigRepository } from "../../../core/interfaces";

export interface OnlineConfigRepositoryFactory {
  getRepository(
    sourceId: SourceId
  ): Promise<
    Result<OnlineBookSourceConfigRepository<DirectoryId>, OnlineSourceError>
  >;
}
