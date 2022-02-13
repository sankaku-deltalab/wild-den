import { injectable, singleton } from "tsyringe";

/** Date time as IOSString. */
export type DateTime = string;

export interface DateUtil {
  now(): DateTime;
}

@singleton()
@injectable()
export class DateUtilImpl implements DateUtil {
  now(): DateTime {
    return new Date().toISOString();
  }
}
