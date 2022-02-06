import { inject, injectable, singleton } from "tsyringe";
import { ok, err, Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  LocalBookRepository,
  LocalRepositoryConnectionError,
  BookId,
  DataUri,
  BookSource,
  OnlineItemError,
  fileContentToBookContent,
  BookContentProps,
  LocalItemLoadError,
  LoadProgressCallback,
} from "../../../core";
import { injectTokens as it } from "../../../inject-tokens";
import { DateUtil } from "../../../util";

type LoadBookContentDataType = (
  id: BookId,
  bookSources: BookSource[],
  loadProgressCallback?: LoadProgressCallback
) => Promise<
  Result<
    { props: BookContentProps; data: DataUri },
    OnlineItemError | LocalRepositoryConnectionError
  >
>;

/**
 * Load book content from local or online repository.
 * If content is exist in local, return it.
 * If content is not exist in local and exist in online, download it and store to local.
 */
export interface LoadBookContentData
  extends FunctionClass<LoadBookContentDataType> {}

@singleton()
@injectable()
export class LoadBookContentDataImpl implements LoadBookContentData {
  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(
    id: BookId,
    bookSources: BookSource[],
    loadProgressCallback?: LoadProgressCallback
  ): Promise<
    Result<
      { props: BookContentProps; data: DataUri },
      OnlineItemError | LocalRepositoryConnectionError
    >
  > {
    const localLoad = await this.loadLocalContent(id);
    if (localLoad.ok) return localLoad;

    const onlineLoad = await this.loadOnlineContent(
      id,
      bookSources,
      loadProgressCallback ?? (() => {})
    );
    if (onlineLoad.err) return onlineLoad;

    const storeToLocal = await this.localRepo.storeContent(
      onlineLoad.val.props,
      onlineLoad.val.data
    );
    if (storeToLocal.err) return storeToLocal;

    return ok(onlineLoad.val);
  }

  private async loadLocalContent(
    id: BookId
  ): Promise<
    Result<{ props: BookContentProps; data: DataUri }, LocalItemLoadError>
  > {
    const [localContentProps, localContentData] = await Promise.all([
      this.localRepo.loadContentProps(id),
      this.localRepo.loadContentData(id),
    ]);
    if (localContentProps.err) return localContentProps;
    if (localContentData.err) return localContentData;
    return ok({ props: localContentProps.val, data: localContentData.val });
  }

  private async loadOnlineContent(
    id: BookId,
    bookSources: BookSource[],
    loadProgressCallback: LoadProgressCallback
  ): Promise<
    Result<{ props: BookContentProps; data: DataUri }, OnlineItemError>
  > {
    const sources = bookSources.filter((s) => s.getSourceId() === id.source);
    if (sources.length < 1) return err("not exists");
    const source = sources[0];

    const now = this.date.now();
    const loadedContent = await source.loadContent(
      id.file,
      loadProgressCallback
    );
    if (loadedContent.err) return loadedContent;

    return ok(fileContentToBookContent(loadedContent.val, now));
  }
}
