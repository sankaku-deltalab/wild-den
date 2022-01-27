import { BookProps, BookFileBlob, BookCacheRepository } from "../core";
import { DateUtil } from "../util";

export class UpdateBookAsRead {
  constructor(private readonly date: DateUtil) {}

  run(cache: BookCacheRepository, blob: BookFileBlob): void {
    const props = cache.getBookProps(blob.id);
    if (props.err) return;
    const oldState = props.val.readState;
    const newState = oldState === "new" ? "reading" : oldState;
    const updatedProps: BookProps = {
      ...props.val,
      lastReadDate: this.date.now(),
      readState: newState,
    };
    cache.setBookProps(updatedProps);
  }
}
