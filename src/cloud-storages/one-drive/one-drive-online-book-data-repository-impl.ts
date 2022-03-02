import { inject, injectable, singleton } from "tsyringe";
import { encode as base64Encode } from "js-base64";
import { injectTokens as it } from "../../inject-tokens";
import { Result, ok, err, isOk } from "../../results";
import {
  BookId,
  bookIdToStr,
  BookProps,
  BookRecord,
  BooksDiff,
  OnlineBookError,
  OnlineSourceError,
  somethingWrongError,
  SourceId,
} from "../../core";
import { OnlineBookDataRepository } from "../../core/interfaces";
import {
  MsGraphClientUtilRest,
  MsGraphClientWrapperRest,
  MsGraphClientWrapperRestFactory,
} from "./interfaces";
import { MsalInstanceRepository } from "../../use-cases/book-sources/one-drive/interfaces";
import { isFile } from "./util";

const bookPropsDir = "book-props";

const dataUriToJsonObj = <T>(dataUri: string): T => {
  const [_prefix, ...data] = dataUri.split(",");
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
    @inject(it.MsGraphClientWrapperRestFactory)
    private readonly msGraphClientWrapperFactory: MsGraphClientWrapperRestFactory,
    @inject(it.MsGraphClientUtilRest)
    private readonly clientUtil: MsGraphClientUtilRest
  ) {}

  async loadAllStoredBookProps(
    source: SourceId
  ): Promise<Result<BookRecord<BookProps>, OnlineSourceError>> {
    const client = this.getClient(source);
    if (client.err) return client;

    await client.val.postItem(
      {
        type: "appRoot",
      },
      JSON.stringify({ name: bookPropsDir, folder: {} })
    );
    const items = await client.val.getChildren({
      type: "appItemByPath",
      parentPath: [],
      itemName: bookPropsDir,
    });
    if (items.err) return err(somethingWrongError(JSON.stringify(items.val)));

    const books = (
      await Promise.all(
        items.val
          .filter(isFile)
          .map((f) =>
            this.clientUtil.downloadItemFromAppFolderByPath(
              client.val,
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

    const r = await this.clientUtil.downloadItemFromAppFolderByPath(
      client.val,
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

    const deleting = await client.val.deleteItem({
      type: "appItemByPath",
      parentPath: [],
      itemName: bookPropsDir,
    });
    if (deleting.err)
      return err(somethingWrongError(JSON.stringify(deleting.val)));

    for (const p of Object.values(props)) {
      await this.storeBookProps(p);
    }

    return ok(undefined);
  }

  async updateBookPropsOfSourceByDiff(
    source: SourceId,
    newProps: BookRecord<BookProps>,
    diff: BooksDiff
  ): Promise<Result<void, OnlineSourceError>> {
    const client = this.getClient(source);
    if (client.err) return client;

    for (const bookId of diff.delete.keys()) {
      const deleting = await client.val.deleteItem({
        type: "appItemByPath",
        parentPath: [],
        itemName: bookIdToFileName(bookId),
      });
      if (deleting.err)
        return err(somethingWrongError(JSON.stringify(deleting.val)));
    }

    for (const bookId of [...diff.add.keys(), ...diff.update.keys()]) {
      const props = newProps[bookIdToStr(bookId)];
      const putting = await client.val.putItem(
        {
          type: "appItemByPath",
          parentPath: [bookPropsDir],
          itemName: bookIdToFileName(bookId),
        },
        JSON.stringify(props)
      );
      if (putting.err)
        return err(somethingWrongError(JSON.stringify(putting.val)));
    }

    return ok(undefined);
  }

  async storeBookProps(
    props: BookProps
  ): Promise<Result<void, OnlineBookError>> {
    const client = this.getClient(props.id.source);
    if (client.err) return client;

    const r = await client.val.putItem(
      {
        type: "appItemByPath",
        parentPath: [bookPropsDir],
        itemName: bookIdToFileName(props.id),
      },
      JSON.stringify(props)
    );
    if (r.err) return err(somethingWrongError(JSON.stringify(r.val)));

    return ok(undefined);
  }

  private getClient(
    source: SourceId
  ): Result<MsGraphClientWrapperRest, OnlineSourceError> {
    return this.msGraphClientWrapperFactory.getClientWrapper(source);
  }
}
