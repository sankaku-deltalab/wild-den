import { MsGraphClientWrapper } from ".";
import { SourceId, SourceIdStr, SourceNotAvailableError } from "../../../core";
import { Result } from "../../../results";
import { MsalInstanceType } from "../../../use-cases/book-sources/one-drive";

export interface MsGraphClientWrapperFactory {
  getClientWrappers(
    msalInstance: MsalInstanceType
  ): Record<SourceIdStr, MsGraphClientWrapper>;

  getClientWrapper(
    sourceId: SourceId,
    msalInstance: MsalInstanceType
  ): Result<MsGraphClientWrapper, SourceNotAvailableError>;
}
