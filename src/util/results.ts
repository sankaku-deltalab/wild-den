// clone of ts-result and https://imhoff.blog/posts/using-results-in-typescript
// ts-result is usable but not serializable

export type Result<T, E = Error> =
  | { ok: true; err: false; val: T }
  | { ok: false; err: true; val: E };

export const ok = <T>(val: T): Result<T, never> => ({
  ok: true,
  err: false,
  val,
});

export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  err: true,
  val: error,
});

export const unwrap = <T>(result: Result<T, unknown>): T => {
  if (result.err) {
    const errObj =
      result.val instanceof Error
        ? result.val
        : new Error(`unwrap failed. value: ${result.val}`);
    throw errObj;
  }
  return result.val;
};

export const unwrapOr = <T>(result: Result<T, unknown>, optional: T): T => {
  if (result.err) {
    return optional;
  }
  return result.val;
};
