import { OnlineSourceError, SourceId } from "../../core";
import { OnlineBookSourceConfigRepository } from "../../core/interfaces";
import { Result } from "../../results";
import { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";

export interface OneDriveOnlineConfigRepositoryFactory {
  getRepository(
    sourceId: SourceId
  ): Promise<
    Result<
      OnlineBookSourceConfigRepository<OneDriveDirectoryId>,
      OnlineSourceError
    >
  >;
}
