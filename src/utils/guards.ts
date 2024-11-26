// export const isObject = <T = Record<string, unknown>>(value: unknown): value is T =>
//   typeof value === 'object' && value !== null && !Array.isArray(value);

export const isObject = (data: any): data is Obj => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    (Object.keys(data) as Array<keyof typeof data>).every(
      (key) => typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol',
    )
  );
};

export const isBoolean = (data: any): data is boolean => {
  return typeof data === 'boolean';
};

export const isString = (data: any): data is string => {
  return typeof data === 'string';
};

export const isNull = (data: any): data is null => {
  return data === null;
};

export const isUndefined = (data: any): data is undefined => {
  return data === undefined;
};

export const isNumber = (data: any): data is number => {
  return typeof data === 'number';
};

export const isArray = (data: any): data is [] => {
  return Array.isArray(data);
};

export const isFunction = (data: any): data is void => {
  return typeof data === 'function';
};

export const assertsTest = 'test';
