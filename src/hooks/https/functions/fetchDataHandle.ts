import { isObject, replace } from '@utils';

import { IHttpsFetchOptions, THttpsFetchInput } from '../https.types';

const getPairs = (obj: Obj): [string[], string][] => {
  return Object.entries(obj).reduce<[string[], string][]>((prev, [key, value]) => {
    if (value === null || value === undefined) return prev;

    if (isObject(value)) {
      getPairs(value).forEach(([keys, val]) => {
        prev.push([[key, ...keys], val.toString()]);
      });
    } else {
      prev.push([[key], value.toString()]);
    }

    return prev;
  }, []);
};
const calculateKey = ([key0, ...keysRest]: string[]) => [key0, ...keysRest.map((a) => `[${a}]`)].join('');
const convertQuery = (object: Obj): Record<string, string> => {
  return Object.fromEntries(getPairs(object).map(([keys, value]) => [calculateKey(keys), value]));
};

const tokenVariant = (
  token: string,
  tokenTemplate: IHttpsFetchOptions['tokenTemplate'] = 'bearer',
): [string, string] => {
  if (tokenTemplate === 'bearer') return ['Authorization', `Bearer ${token}`];

  const [name, value] = tokenTemplate.split(':');
  return [name, replace(value, { token })];
};

export const fetchDataHandle = (
  url: THttpsFetchInput,
  init: RequestInit = {},
  options: Partial<IHttpsFetchOptions> = {},
): [URL, RequestInit | undefined] => {
  const headers = new Headers(init.headers);
  const input = new URL(url);
  let body = init.body;

  if (options.body) {
    body = JSON.stringify(options.body);
    headers.append('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.append(...tokenVariant(options.token, options.tokenTemplate));
  }
  if (options.query) {
    Object.entries(convertQuery(options.query)).forEach(([key, value]) => {
      input.searchParams.append(key, value);
    });
  }

  return [input, { ...init, body, headers }];
};
