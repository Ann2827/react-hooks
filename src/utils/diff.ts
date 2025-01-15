import { isObject, isArray, isBoolean, isNull, isNumber, isString, isUndefined, isFunction } from './guards';
import { stringifyFunction } from './object';

type DataType = 'object' | 'number' | 'array' | 'boolean' | 'null' | 'string' | 'undefined' | 'function' | 'unknown';
type DiffT = string | null | boolean | undefined;

const getType = (data: unknown): DataType => {
  if (isUndefined(data)) return 'undefined';
  if (isNull(data)) return 'null';
  if (isString(data)) return 'string';
  if (isNumber(data)) return 'number';
  if (isBoolean(data)) return 'boolean';
  if (isObject(data)) return 'object';
  if (isArray(data)) return 'array';
  if (isFunction(data)) return 'function';
  return 'unknown';
};

const toWrite = (data: unknown, type: Exclude<DataType, 'unknown'>): DiffT => {
  switch (type) {
    case 'array':
    case 'object':
    case 'function':
      return JSON.stringify(data, stringifyFunction);
    case 'number':
      return (data as number).toString();
    case 'string':
    case 'undefined':
    case 'null':
    case 'boolean':
      return data as DiffT;
  }
};

const getKey = (key: string, prefix: string): string => {
  return prefix ? `${prefix}.${key}` : key;
};
const getStart = (prefix: string): string => {
  return prefix ? `${prefix}:` : '';
};

export const diff = (data1: unknown, data2: unknown, prefix = ''): Array<[string, string]> => {
  const result: Array<[string, string]> = [];
  if (data1 === data2) return result;

  const type1 = getType(data1);
  const type2 = getType(data2);

  if (type1 === 'unknown' || type2 === 'unknown') return result;
  const toWrite1 = toWrite(data1, type1);
  const toWrite2 = toWrite(data2, type2);
  if (toWrite1 === toWrite2) return result;
  if (type1 !== type2 || type1 !== 'object' || type2 !== 'object') {
    result.push([getStart(prefix) + toWrite1, getStart(prefix) + toWrite2]);
    return result;
  }

  const keys1 = Object.keys(data1 as object).sort();
  const keys2 = Object.keys(data2 as object).sort();
  const commonKeys = keys1.map((key) => (keys2.includes(key) ? key : null)).filter((i) => i !== null);
  if (keys1.toString() !== keys2.toString()) {
    (keys1 as Array<keyof typeof data1>).forEach((key) => {
      if (commonKeys.includes(key)) return;
      diff((data1 as object)[key], undefined, getKey(key, prefix)).forEach((i) => {
        result.push(i);
      });
    });
    (keys2 as Array<keyof typeof data2>).forEach((key) => {
      if (commonKeys.includes(key)) return;
      diff(undefined, (data2 as object)[key], getKey(key, prefix)).forEach((i) => {
        result.push(i);
      });
    });
  }

  (commonKeys as Array<keyof typeof data1>).forEach((key) => {
    diff((data1 as object)[key], (data2 as object)[key], getKey(key, prefix)).forEach((i) => {
      result.push(i);
    });
  });

  return result;
};
