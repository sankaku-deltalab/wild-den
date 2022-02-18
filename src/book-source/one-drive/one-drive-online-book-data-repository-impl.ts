import { Result, ok } from "../../results";
import { BookProps, BookRecord, CommonOnlineError, SourceId } from "../../core";
import { OnlineBookDataRepository } from "../../core/interfaces";

// TODO: impl this.
export class OneDriveOnlineBookDataRepositoryImpl
  implements OnlineBookDataRepository
{
  async loadStoredBookProps(
    source: SourceId
  ): Promise<Result<BookRecord<BookProps>, CommonOnlineError>> {
    return ok({});
  }

  async storeBookProps(
    source: SourceId,
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>> {
    return ok(undefined);
  }
}
