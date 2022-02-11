import { Result } from "../../../results";
import { SourceId, DirectoryId, OnlineSourceError } from "../../../core";
import { OnlineBookSourceConfigRepository } from "../../../core/interfaces";

export interface OnlineConfigRepositoryFactory {
  getRepository<DirId extends DirectoryId>(
    sourceId: SourceId
  ): Promise<
    Result<OnlineBookSourceConfigRepository<DirId>, OnlineSourceError>
  >;
}
