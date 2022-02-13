import { container } from "tsyringe";
import { BookSourceFactoryImpl } from "./book-source/book-source-factory-impl";
import { MsGraphClientUtilImpl } from "./book-source/one-drive/ms-graph-client-util-impl";
import { MsGraphClientWrapperFactoryImpl } from "./book-source/one-drive/ms-graph-client/ms-graph-client-wrapper-factory-impl";
import { MsalInstanceRepositoryImpl } from "./book-source/one-drive/msal-instance-repository-impl";
import { OneDriveBookSourceFactoryImpl } from "./book-source/one-drive/one-drive-book-source-factory-impl";
import { OneDriveOnlineBookDataRepositoryFactoryImpl } from "./book-source/one-drive/one-drive-online-book-data-repository-factory-impl";
import { OneDriveOnlineConfigRepositoryFactoryImpl } from "./book-source/one-drive/one-drive-online-config-repository-factory-impl";
import { OnlineBookDataRepositoryFactoryImpl } from "./book-source/online-book-data-repository-factory-impl";
import { OnlineConfigRepositoryFactoryImpl } from "./book-source/online-config-repository-factory-impl";
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
  [it.OnlineBookDataRepositoryFactory]: OnlineBookDataRepositoryFactoryImpl,
  [it.BookSourceFactory]: BookSourceFactoryImpl,
  [it.OneDriveBookSourceFactory]: OneDriveBookSourceFactoryImpl,
  [it.OnlineConfigRepositoryFactory]: OnlineConfigRepositoryFactoryImpl,
  [it.OneDriveOnlineBookDataRepository]:
    OneDriveOnlineBookDataRepositoryFactoryImpl,
  [it.OneDriveOnlineConfigRepositoryFactory]:
    OneDriveOnlineConfigRepositoryFactoryImpl,
};

Object.entries(injectionPairs).forEach(([token, cls]) => {
  container.register(token, { useClass: cls });
});
