import { Result, ok, err } from "../../results";
import {
  BookId,
  BookProps,
  BookRecord,
  CommonOnlineError,
  offlineError,
  OnlineBookError,
  SourceId,
} from "../../core";
import { OnlineBookDataRepository } from "../../core/interfaces";

// TODO: impl this.
export class OneDriveOnlineBookDataRepositoryImpl
  implements OnlineBookDataRepository
{
  async loadAllStoredBookProps(
    source: SourceId
  ): Promise<Result<BookRecord<BookProps>, CommonOnlineError>> {
    return ok({});
  }

  async loadStoredBookProps(
    book: BookId
  ): Promise<Result<BookProps, OnlineBookError>> {
    return err(offlineError());
  }

  async resetBookPropsOfSource(
    source: SourceId,
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>> {
    return ok(undefined);
  }

  async storeBookProps(book: BookId): Promise<Result<void, OnlineBookError>> {
    return err(offlineError());
  }
}
