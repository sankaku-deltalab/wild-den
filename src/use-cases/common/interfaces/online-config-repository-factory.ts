import { Result } from "../../../results";
import {
  SourceId,
  OnlineBookSourceConfigRepository,
  DirectoryId,
  OnlineSourceError,
} from "../../../core";

export interface OnlineConfigRepositoryFactory {
  getRepository<DirId extends DirectoryId>(
    sourceId: SourceId
  ): Promise<
    Result<OnlineBookSourceConfigRepository<DirId>, OnlineSourceError>
  >;
}
