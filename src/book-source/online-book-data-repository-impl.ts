import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../inject-tokens";
import type { Result } from "../results";
import type {
  BookId,
  BookProps,
  BookRecord,
  BooksDiff,
  CommonOnlineError,
  OnlineBookError,
  OnlineSourceError,
  SourceId,
} from "../core";
import type { OnlineBookDataRepository } from "../core/interfaces";
import type { OneDriveOnlineBookDataRepository } from "./interfaces";

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

  updateBookPropsOfSourceByDiff(
    source: SourceId,
    newProps: BookRecord<BookProps>,
    diff: BooksDiff
  ): Promise<Result<void, OnlineSourceError>> {
    return this.oneDrive.updateBookPropsOfSourceByDiff(source, newProps, diff);
  }

  storeBookProps(props: BookProps): Promise<Result<void, OnlineBookError>> {
    return this.oneDrive.storeBookProps(props);
  }
}
