import { isObject } from './guards';

/**
 * При обычном мерже: {...{k: '123'}, ...{k: undefined}} => {k: undefined}
 * Через функцию: {...{k: '123'}, ...{k: undefined}} => {k: '123'}
 */
export const mergeObjects = <T>(baseObj: T, partialObj: PartialRecursive<T>): T => {
  if (!isObject<T>(baseObj) || !isObject<T>(partialObj)) return baseObj;
  // @ts-ignore
  return Object.entries(baseObj).reduce(
    (prev: T, [key, value]) => {
      // @ts-ignore
      if (partialObj?.[key] === undefined) return prev;

      // @ts-ignore
      const newValue: unknown = partialObj[key];
      if (isObject(value) && isObject<T>(newValue)) {
        return {
          ...prev,
          [key]: mergeObjects(value, newValue as PartialRecursive<T>),
        };
      }

      return { ...prev, [key]: newValue };
    },
    { ...baseObj },
  );
};
