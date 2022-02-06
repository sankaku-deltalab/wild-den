import { injectable, singleton } from "tsyringe";
import type { FunctionClass } from "../../../function-class";
import { BookSource, OnlineBookDataRepository, SourceId } from "../../../core";

/**
 * Deal book sources of one cloud storage.
 */
export interface BookSourceFactory {
  getAvailableBookSources(): Promise<
    Record<
      SourceId,
      {
        source: BookSource;
        repository: OnlineBookDataRepository;
      }
    >
  >;
}

type GetAllBookSourcesAndRepositoriesType = (
  factories: BookSourceFactory[]
) => Promise<
  Record<
    SourceId,
    {
      source: BookSource;
      repository: OnlineBookDataRepository;
    }
  >
>;

export interface GetAllBookSourcesAndRepositories
  extends FunctionClass<GetAllBookSourcesAndRepositoriesType> {}

@singleton()
@injectable()
export class GetAllBookSourcesAndRepositoriesImpl
  implements GetAllBookSourcesAndRepositories
{
  async run(factories: BookSourceFactory[]): Promise<
    Record<
      SourceId,
      {
        source: BookSource;
        repository: OnlineBookDataRepository;
      }
    >
  > {
    const r = await Promise.all(
      factories.map((f) => f.getAvailableBookSources())
    );
    return Object.assign({}, ...r);
  }
}
