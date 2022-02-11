import { container } from "tsyringe";
import {
  DeleteBookContentFromLocal,
  DeleteBookContentFromLocalImpl,
  DeleteBookThumbnailFromLocal,
  DeleteBookThumbnailFromLocalImpl,
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
  ScanBooks,
  ScanBooksImpl,
  SyncBookProps,
  SyncBookPropsImpl,
  UpdateBookProps,
  UpdateBookPropsImpl,
} from "../use-cases/common";
import {
  StoreBookSourceConfig,
  StoreBookSourceConfigImpl,
} from "../use-cases/common/book-source-config/store-book-source-config";

export const loadLocalBookProps: LoadLocalBookProps = container.resolve(
  LoadLocalBookPropsImpl
);
export const scanBooks: ScanBooks = container.resolve(ScanBooksImpl);
export const scanBookProps: SyncBookProps =
  container.resolve(SyncBookPropsImpl);
export const updateBookProps: UpdateBookProps =
  container.resolve(UpdateBookPropsImpl);

// book-content
export const deleteBookContentFromLocal: DeleteBookContentFromLocal =
  container.resolve(DeleteBookContentFromLocalImpl);
export const loadBookContent: LoadBookContent =
  container.resolve(LoadBookContentImpl);
export const loadLocalBookContentProps: LoadLocalBookContentProps =
  container.resolve(LoadLocalBookContentPropsImpl);

// book-source-config
export const loadBookSourceConfig: LoadBookSourceConfig = container.resolve(
  LoadBookSourceConfigImpl
);
export const storeBookSourceConfig: StoreBookSourceConfig = container.resolve(
  StoreBookSourceConfigImpl
);

// book-content
export const deleteBookThumbnailFromLocal: DeleteBookThumbnailFromLocal =
  container.resolve(DeleteBookThumbnailFromLocalImpl);
export const loadBookThumbnail: LoadBookThumbnail = container.resolve(
  LoadBookThumbnailImpl
);
export const loadLocalBookThumbnailProps: LoadLocalBookThumbnailProps =
  container.resolve(LoadLocalBookThumbnailPropsImpl);
