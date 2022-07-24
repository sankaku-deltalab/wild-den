import { inject, injectable, singleton } from "tsyringe";
import type { FunctionClass } from "../../function-class";
import type { SourceId } from "../../core";
import { injectTokens as it } from "../../inject-tokens";
import type { BookSource } from "../../core/interfaces";

type GetAvailableSourceIdsType = () => Promise<SourceId[]>;

export interface GetAvailableSourceIds
  extends FunctionClass<GetAvailableSourceIdsType> {}

@singleton()
@injectable()
export class GetAvailableSourceIdsImpl implements GetAvailableSourceIds {
  constructor(
    @inject(it.BookSource)
    private readonly bookSource: BookSource
  ) {}

  async run() {
    return await this.bookSource.getAllAvailableBookSourceIds();
  }
}
