export interface DateUtil {
  now(): string;
}

export class DateUtilImpl implements DateUtil {
  now(): string {
    return new Date().toISOString();
  }
}
