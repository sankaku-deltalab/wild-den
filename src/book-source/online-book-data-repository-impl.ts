import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../inject-tokens";
import { Result } from "../results";
import {
  BookId,
  BookProps,
  BookRecord,
  CommonOnlineError,
  OnlineBookError,
  OnlineSourceError,
  SourceId,
} from "../core";
import { OnlineBookDataRepository } from "../core/interfaces";
import { OneDriveOnlineBookDataRepository } from "./interfaces";

@singleton()
@injectable()
export class OnlineBookDataRepositoryImpl implements OnlineBookDataRepository {
  constructor(
    @inject(it.OneDriveOnlineBookDataRepository)
    private readonly oneDrive: OneDriveOnlineBookDataRepository
  ) {}

  loadAllStoredBookProps(
    source: SourceId
  ): Promise<Result<BookRecord<BookProps>, OnlineSourceError>> {
    return this.oneDrive.loadAllStoredBookProps(source);
  }

  loadStoredBookProps(
    book: BookId
  ): Promise<Result<BookProps, OnlineBookError>> {
    return this.oneDrive.loadStoredBookProps(book);
  }

  resetBookPropsOfSource(
    source: SourceId,
    props: BookRecord<BookProps>
  ): Promise<Result<void, OnlineSourceError>> {
    return this.oneDrive.resetBookPropsOfSource(source, props);
  }

  storeBookProps(props: BookProps): Promise<Result<void, OnlineBookError>> {
    return this.oneDrive.storeBookProps(props);
  }
}
