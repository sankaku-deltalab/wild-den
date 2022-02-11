import { MsGraphClientWrapper } from ".";
import { SourceIdStr } from "../../../core";
import { MsalInstanceType } from "../../../use-cases/book-sources/one-drive";

export interface MsGraphClientWrapperFactory {
  getClientWrappers(
    msalInstance: MsalInstanceType
  ): Record<SourceIdStr, MsGraphClientWrapper>;
}
