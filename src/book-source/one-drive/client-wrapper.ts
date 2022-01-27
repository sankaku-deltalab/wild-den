import { Client } from "@microsoft/microsoft-graph-client";
import axios from "axios";
import { Base64 } from "js-base64";
import {
  BookFileBlob,
  BookFileProps,
  BookFileThumbnail,
  BookId,
  BookIdStr,
  bookIdToStr,
  SourceId,
} from "../../core";
import { DateUtil, Result, ok, err } from "../../util";

type DriveItem = DriveItemAsFolder | DriveItemAsFile;

type DriveItemCore = {
  createdDateTime: string;
  eTag: string;
  id: string;
  lastModifiedDateTime: string;
  name: string;
  webUrl: string;
  cTag: string;
  size: number;
  parentReference: {
    driveId: string;
    driveType: string;
    id: string;
    path: string;
  };
  fileSystemInfo: {
    createdDateTime: string;
    lastModifiedDateTime: string;
  };
  shared?: {
    owner: {
      user: {
        displayName: string;
        id: string;
      };
    };
  };
};

type DriveItemAsFolder = DriveItemCore & {
  folder: {
    childCount: number;
  };
};

type DriveItemAsFile = DriveItemCore & {
  "@microsoft.graph.downloadUrl": string;
  file: {
    mimeType: string;
    hashes: {
      quickXorHash: string;
    };
  };
};

type SearchResult = {
  "@odata.context"?: string;
  "@odata.nextLink"?: string;
  value: DriveItem[];
};

type ThumbnailsResult = {
  "@odata.context"?: string;
  value: {
    id: string;
    large: ThumbnailItem;
    medium: ThumbnailItem;
    small: ThumbnailItem;
  };
};

type ThumbnailItem = {
  height: number;
  width: number;
  url: string;
};

export interface MsGraphClientWrapper {
  getBookFiles(sourceId: SourceId): Promise<Record<BookIdStr, BookFileProps>>;

  downloadBookThumbnail(
    bookId: BookId
  ): Promise<Result<BookFileThumbnail, "misc">>;

  downloadBookBlob(bookId: BookId): Promise<Result<BookFileBlob, "misc">>;
}

const percentDecodePath = (path: string) =>
  path
    .split("/")
    .map((v) => decodeURIComponent(v))
    .join("/");

const trimOneDrivePath = (path: string) => {
  const splittedPath = path.split("/").map((v) => decodeURIComponent(v));
  let splittedNewPath: string[] = [];
  for (const p of splittedPath.reverse()) {
    if (p.endsWith(":")) break;
    splittedNewPath = [p, ...splittedNewPath];
  }
  return splittedNewPath.join("/");
};

const base64FileSize = (base64File: string) => {
  // https://softwareengineering.stackexchange.com/questions/288670/know-file-size-with-a-base64-string
  const sizeOffset = base64File.endsWith("==") ? 2 : 1;
  return base64File.length * (3 / 4) - sizeOffset;
};

export class MsGraphClientWrapperImpl implements MsGraphClientWrapper {
  constructor(
    private readonly dateUtil: DateUtil,
    private readonly client: Client
  ) {}

  async getBookFiles(
    sourceId: SourceId
  ): Promise<Record<BookIdStr, BookFileProps>> {
    // NOTE: https://docs.microsoft.com/en-us/graph/api/driveitem-search?view=graph-rest-1.0&tabs=http
    const items: DriveItem[] = [];
    let r: SearchResult = await this.client
      .api("/me/drive/search(q='pdf or epub')")
      .get();
    items.push(...r.value);
    while (r["@odata.nextLink"]) {
      r = await this.client.api(r["@odata.nextLink"]).get();
      r.value;
      items.push(...r.value);
    }

    return Object.fromEntries(
      items
        .filter((v) => "file" in v && v.file.mimeType === "application/pdf")
        .map((v) => [
          bookIdToStr({ source: sourceId, file: v.id }),
          {
            id: { source: sourceId, file: v.id },
            type: "pdf",
            title: v.name,
            path: trimOneDrivePath(v.parentReference.path),
          },
        ])
    );
  }

  async downloadBookThumbnail(
    bookId: BookId
  ): Promise<Result<BookFileThumbnail, "misc">> {
    const values = bookId.file.split("!");
    if (values.length !== 2) {
      return err("misc");
    }
    const driveId = values[0];
    const itemId = bookId.file;
    const r: ThumbnailsResult = await this.client
      .api(`/drives/${driveId}/items/${itemId}`)
      .get();

    const file = await axios.get(r.value.medium.url);
    if (file.status !== 200) return err("misc");

    const base64BookThumbnail = Base64.encode(file.data, true);
    const now = this.dateUtil.now();
    return ok({
      id: bookId,
      lastLoadedDate: now,
      type: "pdf",
      fileSizeByte: base64FileSize(base64BookThumbnail),
      blob: base64BookThumbnail,
    });
  }

  async downloadBookBlob(
    bookId: BookId
  ): Promise<Result<BookFileBlob, "misc">> {
    console.log("downloadBookBlob");
    try {
      const values = bookId.file.split("!");
      if (values.length !== 2) {
        console.log("values error", values);
        return err("misc");
      }
      const driveId = values[0];
      const itemId = bookId.file;
      const r: DriveItemAsFile = await this.client
        .api(`/drives/${driveId}/items/${itemId}`)
        .get();

      const file = await axios.get(r["@microsoft.graph.downloadUrl"]);
      if (file.status !== 200) return err("misc");

      const base64BookBlob = Base64.encode(file.data, true);
      const now = this.dateUtil.now();
      return ok({
        id: bookId,
        lastLoadedDate: now,
        type: "pdf",
        fileSizeByte: r.size,
        blob: base64BookBlob,
      });
    } catch (e) {
      console.log("er");
      console.log(e);
      throw e;
    }
  }
}
