import { inject, injectable, singleton } from "tsyringe";
import { ok, err, Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  LocalRepositoryConnectionError,
  BookId,
  DataUri,
  OnlineBookError,
  BookContentProps,
  LocalRepositoryBookError,
  bookNotExistsInSourceError,
  OnlineSourceError,
  OnlineBookAndSourceError,
} from "../../../core";
import type {
  LocalBookRepository,
  BookSource,
  LoadProgressCallback,
  FileContent,
} from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";
import type { DateTime, DateUtil } from "../../../util";

type LoadBookContentType = (
  id: BookId,
  loadProgressCallback?: LoadProgressCallback
) => Promise<
  Result<
    { props: BookContentProps; data: DataUri },
    OnlineBookAndSourceError | LocalRepositoryConnectionError
  >
>;

/**
 * Load book content from local or online repository.
 * If content is exist in local, return it.
 * If content is not exist in local and exist in online, download it and store to local.
 */
export interface LoadBookContent extends FunctionClass<LoadBookContentType> {}

@singleton()
@injectable()
export class LoadBookContentImpl implements LoadBookContent {
  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil,
    @inject(it.BookSource)
    private readonly bookSource: BookSource,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(
    id: BookId,
    loadProgressCallback?: LoadProgressCallback
  ): Promise<
    Result<
      { props: BookContentProps; data: DataUri },
      OnlineBookAndSourceError | LocalRepositoryConnectionError
    >
  > {
    const localLoad = await this.loadLocalContent(id);
    if (localLoad.ok) return localLoad;

    const onlineLoad = await this.loadOnlineContent(
      id,
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
    Result<{ props: BookContentProps; data: DataUri }, LocalRepositoryBookError>
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
    loadProgressCallback: LoadProgressCallback
  ): Promise<
    Result<{ props: BookContentProps; data: DataUri }, OnlineBookAndSourceError>
  > {
    const now = this.date.now();
    const loadedContent = await this.bookSource.loadContent(
      id,
      loadProgressCallback
    );
    if (loadedContent.err) return loadedContent;

    return ok(fileContentToBookContent(loadedContent.val, now));
  }
}

const fileContentToBookContent = (
  fileContent: FileContent,
  now: DateTime
): { props: BookContentProps; data: DataUri } => {
  const props: BookContentProps = {
    id: fileContent.id,
    loadedDate: now,
    lastFileModifiedDate: fileContent.lastModifiedDate,
    type: fileContent.type,
    fileSizeByte: fileContent.fileSizeByte,
  };
  return {
    props,
    data: fileContent.dataUri,
  };
};
