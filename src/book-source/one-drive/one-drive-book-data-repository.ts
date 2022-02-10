import { Result, ok } from "../../results";
import {
  BookProps,
  BookRecord,
  CommonOnlineError,
  OnlineBookDataRepository,
  SourceId,
} from "../../core";
import { OneDriveDirectoryId } from "../../use-cases/book-sources/one-drive";
import { MsGraphClientUtil } from "./interfaces/ms-graph-client-util";
import { MsGraphClientWrapper } from "./interfaces";

// TODO: impl this.
export class OneDriveOnlineRepository implements OnlineBookDataRepository {
  constructor(
    private readonly sourceId: SourceId,
    private readonly client: MsGraphClientWrapper,
    private readonly clientUtil: MsGraphClientUtil
  ) {}

  getSourceId(): SourceId {
    return this.sourceId;
  }

  async loadStoredBookProps(): Promise<
    Result<BookRecord<BookProps>, CommonOnlineError>
  > {
    return ok({});
  }

  async storeBookProps(
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>> {
    return ok(undefined);
  }

  async loadTargetDirectories(): Promise<
    Result<OneDriveDirectoryId[], CommonOnlineError>
  > {
    return ok([]);
  }

  async storeTargetDirectories(
    directories: OneDriveDirectoryId[]
  ): Promise<Result<void, CommonOnlineError>> {
    return ok(undefined);
  }
}
