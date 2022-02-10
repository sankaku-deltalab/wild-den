/** Date time as IOSString. */
export type DateTime = string;

export interface DateUtil {
  now(): DateTime;
}

export class DateUtilImpl implements DateUtil {
  now(): DateTime {
    return new Date().toISOString();
  }
}
