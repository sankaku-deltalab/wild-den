import { container } from "tsyringe";
import { BookSourceImpl } from "./book-source/book-source-impl";
import { MsGraphClientUtilImpl } from "./book-source/one-drive/ms-graph-client-util-impl";
import { MsGraphClientWrapperFactoryImpl } from "./book-source/one-drive/ms-graph-client/ms-graph-client-wrapper-factory-impl";
import { MsalInstanceRepositoryImpl } from "./book-source/one-drive/msal-instance-repository-impl";
import { OneDriveBookSourceImpl } from "./book-source/one-drive/one-drive-book-source-impl";
import { OneDriveOnlineBookDataRepositoryImpl } from "./book-source/one-drive/one-drive-online-book-data-repository-impl";
import { OneDriveOnlineConfigRepositoryMock } from "./book-source/one-drive/one-drive-online-config-repository-mock";
import { OnlineBookDataRepositoryImpl } from "./book-source/online-book-data-repository-impl";
import { OnlineConfigRepositoryImpl } from "./book-source/online-config-repository-impl";

import { injectTokens as it } from "./inject-tokens";
import { LocalBookRepositoryMock } from "./local-book-repository";
import { DateUtilImpl } from "./util";

type ClassObject = {
  new (...args: any[]): any;
};

export const injectionPairs: Record<string, ClassObject> = {
  [it.LocalBookRepository]: LocalBookRepositoryMock,
  [it.DateUtil]: DateUtilImpl,
  [it.MsGraphClientWrapperFactory]: MsGraphClientWrapperFactoryImpl,
  [it.MsalInstanceRepository]: MsalInstanceRepositoryImpl,
  [it.MsGraphClientUtil]: MsGraphClientUtilImpl,
  [it.OnlineBookDataRepository]: OnlineBookDataRepositoryImpl,
  [it.BookSource]: BookSourceImpl,
  [it.OneDriveBookSource]: OneDriveBookSourceImpl,
  [it.OnlineConfigRepository]: OnlineConfigRepositoryImpl,
  [it.OneDriveOnlineBookDataRepository]: OneDriveOnlineBookDataRepositoryImpl,
  [it.OneDriveOnlineConfigRepository]: OneDriveOnlineConfigRepositoryMock,
};

Object.entries(injectionPairs).forEach(([token, cls]) => {
  container.register(token, { useClass: cls });
});
