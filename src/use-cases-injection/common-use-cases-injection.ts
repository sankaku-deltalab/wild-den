import { container } from "tsyringe";
import "../injection";
import {
  ClearLocalRepository,
  ClearLocalRepositoryImpl,
  DeleteBookContentFromLocal,
  DeleteBookContentFromLocalImpl,
  DeleteBookThumbnailFromLocal,
  DeleteBookThumbnailFromLocalImpl,
  GetAvailableSourceIds,
  GetAvailableSourceIdsImpl,
  LoadBookContent,
  LoadBookContentImpl,
  LoadBookSourceConfig,
  LoadBookSourceConfigImpl,
  LoadBookThumbnail,
  LoadBookThumbnailImpl,
  LoadLocalBookContentProps,
  LoadLocalBookContentPropsImpl,
  LoadLocalBookProps,
  LoadLocalBookPropsImpl,
  LoadLocalBookThumbnailProps,
  LoadLocalBookThumbnailPropsImpl,
  ScanBooksFromAvailableSources,
  ScanBooksFromAvailableSourcesImpl,
  ScanBooksFromSingleSource,
  ScanBooksFromSingleSourceImpl,
  SyncBookProps,
  SyncBookPropsImpl,
  UpdateBookProps,
  UpdateBookPropsImpl,
} from "../use-cases/common";
import {
  StoreBookSourceConfig,
  StoreBookSourceConfigImpl,
} from "../use-cases/common/book-source-config/store-book-source-config";

export const clearLocalRepository = container.resolve<ClearLocalRepository>(
  ClearLocalRepositoryImpl
);

export const getAvailableSourceIds = container.resolve<GetAvailableSourceIds>(
  GetAvailableSourceIdsImpl
);
export const loadLocalBookProps = container.resolve<LoadLocalBookProps>(
  LoadLocalBookPropsImpl
);
export const scanBooksFromSingleSource =
  container.resolve<ScanBooksFromSingleSource>(ScanBooksFromSingleSourceImpl);
export const scanBooksFromAvailableSources =
  container.resolve<ScanBooksFromAvailableSources>(
    ScanBooksFromAvailableSourcesImpl
  );
export const scanBookProps =
  container.resolve<SyncBookProps>(SyncBookPropsImpl);
export const updateBookProps =
  container.resolve<UpdateBookProps>(UpdateBookPropsImpl);

// book-content
export const deleteBookContentFromLocal =
  container.resolve<DeleteBookContentFromLocal>(DeleteBookContentFromLocalImpl);
export const loadBookContent =
  container.resolve<LoadBookContent>(LoadBookContentImpl);
export const loadLocalBookContentProps =
  container.resolve<LoadLocalBookContentProps>(LoadLocalBookContentPropsImpl);

// book-source-config
export const loadBookSourceConfig = container.resolve<LoadBookSourceConfig>(
  LoadBookSourceConfigImpl
);
export const storeBookSourceConfig = container.resolve<StoreBookSourceConfig>(
  StoreBookSourceConfigImpl
);

// book-content
export const deleteBookThumbnailFromLocal =
  container.resolve<DeleteBookThumbnailFromLocal>(
    DeleteBookThumbnailFromLocalImpl
  );
export const loadBookThumbnail = container.resolve<LoadBookThumbnail>(
  LoadBookThumbnailImpl
);
export const loadLocalBookThumbnailProps =
  container.resolve<LoadLocalBookThumbnailProps>(
    LoadLocalBookThumbnailPropsImpl
  );
