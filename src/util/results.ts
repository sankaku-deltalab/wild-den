// clone of ts-results but simple and serializable
export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
  ok: true;
  err: false;
  val: T;
};

export type Err<T> = {
  ok: false;
  err: true;
  val: T;
};

export const ok = <T>(val: T): Ok<T> => ({
  ok: true,
  err: false,
  val,
});

export const err = <T>(val: T): Err<T> => ({
  ok: false,
  err: true,
  val,
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
