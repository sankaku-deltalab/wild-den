import { inject, injectable, singleton } from "tsyringe";
import type { FunctionClass } from "../../function-class";
import { SourceId } from "../../core";
import { injectTokens as it } from "../../inject-tokens";
import { BookSourceFactory } from "./interfaces";

type GetAvailableSourceIdsType = () => Promise<SourceId[]>;

export interface GetAvailableSourceIds
  extends FunctionClass<GetAvailableSourceIdsType> {}

@singleton()
@injectable()
export class GetAvailableSourceIdsImpl implements GetAvailableSourceIds {
  constructor(
    @inject(it.BookSourceFactory)
    private readonly bookSourceFactory: BookSourceFactory
  ) {}

  async run() {
    return await this.bookSourceFactory.getAllAvailableBookSourceIds();
  }
}
