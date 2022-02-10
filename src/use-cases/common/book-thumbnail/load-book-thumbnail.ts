import { inject, injectable, singleton } from "tsyringe";
import { ok, err, Result } from "../../../results";
import type { FunctionClass } from "../../../function-class";
import {
  BookId,
  DataUri,
  OnlineBookError,
  BookThumbnailProps,
  LocalRepositoryBookError,
  bookNotExistsInSourceError,
} from "../../../core";
import { LocalBookRepository, BookSource } from "../../../core/interfaces";
import { injectTokens as it } from "../../../inject-tokens";
import { DateTime, DateUtil } from "../../../util";
import { FileThumbnail } from "../../../core/interfaces";

type LoadBookThumbnailDataType = (
  id: BookId,
  bookSources: BookSource[]
) => Promise<
  Result<
    { props: BookThumbnailProps; data: DataUri },
    OnlineBookError | LocalRepositoryBookError
  >
>;

/**
 * Load book thumbnail from local or online repository.
 * If thumbnail is exist in local, return it.
 * If thumbnail is not exist in local and exist in online, download it and store to local.
 */
export interface LoadBookThumbnailData
  extends FunctionClass<LoadBookThumbnailDataType> {}

@singleton()
@injectable()
export class LoadBookThumbnailDataImpl implements LoadBookThumbnailData {
  constructor(
    @inject(it.DateUtil)
    private readonly date: DateUtil,
    @inject(it.LocalBookRepository)
    private readonly localRepo: LocalBookRepository
  ) {}

  async run(
    id: BookId,
    bookSources: BookSource[]
  ): Promise<
    Result<
      { props: BookThumbnailProps; data: DataUri },
      OnlineBookError | LocalRepositoryBookError
    >
  > {
    const localLoad = await this.loadLocalThumbnail(id);
    if (localLoad.ok) return localLoad;

    const onlineLoad = await this.loadOnlineThumbnail(id, bookSources);
    if (onlineLoad.err) return onlineLoad;

    const storeToLocal = await this.localRepo.storeThumbnail(
      onlineLoad.val.props,
      onlineLoad.val.data
    );
    if (storeToLocal.err) return storeToLocal;

    return ok(onlineLoad.val);
  }

  private async loadLocalThumbnail(
    id: BookId
  ): Promise<
    Result<
      { props: BookThumbnailProps; data: DataUri },
      LocalRepositoryBookError
    >
  > {
    const [localThumbnailProps, localThumbnailData] = await Promise.all([
      this.localRepo.loadThumbnailProps(id),
      this.localRepo.loadThumbnailData(id),
    ]);
    if (localThumbnailProps.err) return localThumbnailProps;
    if (localThumbnailData.err) return localThumbnailData;
    return ok({ props: localThumbnailProps.val, data: localThumbnailData.val });
  }

  private async loadOnlineThumbnail(
    id: BookId,
    bookSources: BookSource[]
  ): Promise<
    Result<{ props: BookThumbnailProps; data: DataUri }, OnlineBookError>
  > {
    const sources = bookSources.filter((s) => s.getSourceId() === id.source);
    if (sources.length < 1) return err(bookNotExistsInSourceError(id));
    const source = sources[0];

    const now = this.date.now();
    const loadedThumbnail = await source.loadThumbnail(id.file);
    if (loadedThumbnail.err) return loadedThumbnail;

    return ok(fileThumbnailToBookThumbnail(loadedThumbnail.val, now));
  }
}

const fileThumbnailToBookThumbnail = (
  fileThumbnail: FileThumbnail,
  now: DateTime
): { props: BookThumbnailProps; data: DataUri } => {
  const props: BookThumbnailProps = {
    id: fileThumbnail.id,
    loadedDate: now,
    lastFileModifiedDate: fileThumbnail.lastModifiedDate,
    fileSizeByte: fileThumbnail.fileSizeByte,
  };
  return {
    props,
    data: fileThumbnail.dataUri,
  };
};
