import { CommonOnlineError, DataUri } from "../../../core";
import { LoadProgressCallback } from "../../../core/interfaces";
import { Result } from "../../../results";

export interface Downloader {
  downloadAsDataUri(
    url: string,
    loadProgressCallback: LoadProgressCallback
  ): Promise<Result<DataUri, CommonOnlineError>>;
}
