export const filterObj = <V>(
  obj: Record<string, V>,
  filter: (key: string, value: V) => boolean
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => filter(key, value))
  );
};

export const mapObj = <V, V2>(
  obj: Record<string, V>,
  converter: (key: string, value: V) => V2
): Record<string, V2> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, converter(key, value)])
  );
};
