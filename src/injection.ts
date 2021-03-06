import { container } from "tsyringe";
import { BookSourceImpl } from "./book-source/book-source-impl";
import { MsGraphClientUtilRestImpl } from "./cloud-storages/one-drive/driver/ms-graph-client-util-rest-impl";
import { MsGraphClientWrapperRestFactoryImpl } from "./cloud-storages/one-drive/driver/ms-graph-client-wrapper-factory-rest-impl";
import { MsalInstanceRepositoryImpl } from "./cloud-storages/one-drive/driver/msal-instance-repository-impl";
import { OneDriveBookSourceImpl } from "./cloud-storages/one-drive/one-drive-book-source-impl";
import { OneDriveOnlineBookDataRepositoryImpl } from "./cloud-storages/one-drive/one-drive-online-book-data-repository-impl";
import { OneDriveOnlineConfigRepositoryMock } from "./cloud-storages/one-drive/one-drive-online-config-repository-mock";
import { OnlineBookDataRepositoryImpl } from "./book-source/online-book-data-repository-impl";
import { OnlineConfigRepositoryImpl } from "./book-source/online-config-repository-impl";

import { injectTokens as it } from "./inject-tokens";
import { DexieLocalBookRepository } from "./local-book-repository";
import { DateUtilImpl } from "./util";

type ClassObject = {
  new (...args: any[]): any;
};

export const injectionPairs: Record<string, ClassObject> = {
  [it.LocalBookRepository]: DexieLocalBookRepository,
  [it.DateUtil]: DateUtilImpl,
  [it.MsGraphClientWrapperRestFactory]: MsGraphClientWrapperRestFactoryImpl,
  [it.MsalInstanceRepository]: MsalInstanceRepositoryImpl,
  [it.MsGraphClientUtilRest]: MsGraphClientUtilRestImpl,
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
