import { inject, injectable, singleton } from "tsyringe";
import { encode as base64Encode } from "js-base64";
import { injectTokens as it } from "../../inject-tokens";
import { Result, ok, err, isOk } from "../../results";
import {
  BookId,
  bookIdToStr,
  BookProps,
  BookRecord,
  OnlineBookError,
  OnlineSourceError,
  somethingWrongError,
  SourceId,
} from "../../core";
import { OnlineBookDataRepository } from "../../core/interfaces";
import {
  MsGraphClientWrapper,
  MsGraphClientWrapperFactory,
} from "./interfaces";
import { MsalInstanceRepository } from "../../use-cases/book-sources/one-drive/interfaces";
import { isFile } from "./util";

const bookPropsDir = "book-props";

const dataUriToJsonObj = <T>(dataUri: string): T => {
  const [prefix, ...data] = dataUri.split(",");
  if (prefix !== "data:application/json;base64")
    throw new Error(`data is not json ${dataUri}`);
  const b = Buffer.from(data.join(""), "base64");
  return JSON.parse(b.toString());
};

const bookIdToFileName = (book: BookId): string => {
  return base64Encode(bookIdToStr(book), true) + ".json";
};

/**
 * Store books.
 *
 * - /
 *   - book-props
 *     - <bookIdStr>.json
 */
@singleton()
@injectable()
export class OneDriveOnlineBookDataRepositoryImpl
  implements OnlineBookDataRepository
{
  constructor(
    @inject(it.MsGraphClientWrapperFactory)
    private readonly msGraphClientWrapperFactory: MsGraphClientWrapperFactory,
    @inject(it.MsalInstanceRepository)
    private readonly msalInstanceRepository: MsalInstanceRepository
  ) {}

  async loadAllStoredBookProps(
    source: SourceId
  ): Promise<Result<BookRecord<BookProps>, OnlineSourceError>> {
    const client = this.getClient(source);
    if (client.err) return client;

    await client.val.postFolderToAppRoot(bookPropsDir);
    const items = await client.val.getFolderChildrenFromAppFolder(
      [],
      bookPropsDir
    );
    if (items.err) return err(somethingWrongError(JSON.stringify(items.val)));

    const books = (
      await Promise.all(
        items.val
          .filter(isFile)
          .map((f) =>
            client.val.downloadAppFolderItemAsDataUri(
              [bookPropsDir],
              f.name,
              () => {}
            )
          )
      )
    )
      .filter(isOk)
      .map((v) => dataUriToJsonObj<BookProps>(v.val[1]));
    return ok(Object.fromEntries(books.map((b) => [bookIdToStr(b.id), b])));
  }

  async loadStoredBookProps(
    book: BookId
  ): Promise<Result<BookProps, OnlineBookError>> {
    const client = this.getClient(book.source);
    if (client.err) return client;

    const r = await client.val.downloadAppFolderItemAsDataUri(
      [bookPropsDir],
      bookIdToFileName(book),
      () => {}
    );
    if (r.err) return err(somethingWrongError(JSON.stringify(r.val)));

    return ok(dataUriToJsonObj<BookProps>(r.val[1]));
  }

  async resetBookPropsOfSource(
    source: SourceId,
    props: BookRecord<BookProps>
  ): Promise<Result<void, OnlineSourceError>> {
    const client = this.getClient(source);
    if (client.err) return client;

    const deleting = await client.val.deleteItemInAppFolder([], bookPropsDir);
    if (deleting.err)
      return err(somethingWrongError(JSON.stringify(deleting.val)));

    for (const p of Object.values(props)) {
      await this.storeBookProps(p);
    }

    return ok(undefined);
  }

  async storeBookProps(
    props: BookProps
  ): Promise<Result<void, OnlineBookError>> {
    const client = this.getClient(props.id.source);
    if (client.err) return client;

    const r = await client.val.putSmallTextToAppRoot(
      [bookPropsDir],
      bookIdToFileName(props.id),
      JSON.stringify(props)
    );
    if (r.err) return err(somethingWrongError(JSON.stringify(r.val)));

    return ok(undefined);
  }

  private getClient(
    source: SourceId
  ): Result<MsGraphClientWrapper, OnlineSourceError> {
    const msalInstance = this.msalInstanceRepository.get();
    return this.msGraphClientWrapperFactory.getClientWrapper(
      source,
      msalInstance
    );
  }
}
