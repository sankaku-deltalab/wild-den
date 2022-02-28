import { SourceId, SourceIdStr, SourceNotAvailableError } from "../../../core";
import { Result } from "../../../results";
import { MsGraphClientWrapperRest } from "./ms-graph-client-wrapper-rest";

export interface MsGraphClientWrapperRestFactory {
  getClientWrappers(): Record<SourceIdStr, MsGraphClientWrapperRest>;

  getClientWrapper(
    sourceId: SourceId
  ): Result<MsGraphClientWrapperRest, SourceNotAvailableError>;
}
