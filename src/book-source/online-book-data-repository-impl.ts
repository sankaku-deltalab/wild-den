import { inject, injectable, singleton } from "tsyringe";
import { injectTokens as it } from "../inject-tokens";
import { Result } from "../results";
import { BookProps, BookRecord, CommonOnlineError, SourceId } from "../core";
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
  ): Promise<Result<BookRecord<BookProps>, CommonOnlineError>> {
    return this.oneDrive.loadAllStoredBookProps(source);
  }

  async resetBookPropsOfSource(
    source: SourceId,
    props: BookRecord<BookProps>
  ): Promise<Result<void, CommonOnlineError>> {
    return this.oneDrive.resetBookPropsOfSource(source, props);
  }
}
