import { act, renderHook } from '@testing-library/react-hooks';

import mockResponse from '../../../__mocks__/response';
import mockFetch from '../../../__mocks__/fetch';
import mockStorage from '../../../__mocks__/storage';
import { CacheStore } from '../cache';
import { LoaderStore } from '../loader';

import { useHttps, HttpsStore, IHttpsRequest } from '.';

type TError = { errorCode: number } | { _meta: Record<string, unknown> };
type TGetUserSuccess = { userId: string };
declare module '..' {
  interface IHttpsTokenNames {
    names: 'main' | 'second' | 'third';
  }
  interface IHttpsMockNames {
    names: 'scenario1' | 'scenario2' | 'scenario3';
  }
  interface IHttpsRequestsConfig {
    getUser: [(arg: { id: number; mockName: IHttpsMockNames['names'] }) => IHttpsRequest, TGetUserSuccess, TError];
    getUser3: [() => IHttpsRequest, { data: { name: string } }, TError];
    getList: [() => IHttpsRequest, { data: [] }];
  }
}

describe('https HttpsStore:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  let restoreStorage: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    restoreStorage = mockStorage();
    HttpsStore.initialize({
      settings: { loader: true, messages: true, mockMode: true, waitToken: true },
      tokens: {
        main: { template: 'bearer' },
        second: { template: 'x-auth:Bearer ${token}' },
        third: { template: 'bearer', cache: { time: 60, cleanWhenResponseIs: [401] } },
        // test: '123',
      },
      // TODO: add settings response when fetch was catch
      // TODO: add messages settings но не сюда, а по имени реквеста проверять в том хуке
      namedRequests: {
        getUser: ({ id, mockName }): IHttpsRequest => ({
          url: 'https://test.com',
          query: { id },
          tokenName: 'main',
          mockName,
        }),
        getUser3: (): IHttpsRequest => ({
          url: 'https://test.com/2',
          query: { id: 3 },
          token: 'ssss',
        }),
        getList: (): IHttpsRequest => ({
          url: 'https://test.com/list',
          tokenName: 'third',
        }),
      },
      validation: {
        getUser: (dataJson, response): dataJson is TGetUserSuccess =>
          !!response &&
          response.ok &&
          !!dataJson &&
          typeof dataJson === 'object' &&
          dataJson !== null &&
          'userId' in dataJson,
      },
      mocks: {
        // TODO: может позже добавлю настройки моков типо delay, allowReal
        namedRequests: {
          getUser: {
            body: { userId: 1 },
          },
          getUser3: {
            body: { userId: 3 },
          },
          getList: {
            body: { data: [] },
          },
        },
        // TODO: scenarios: {},
        additionalRules: ({ requestName, mockName }) => {
          if (requestName === 'getUser3') return new Response(JSON.stringify({ userId: 4 }));
          if (requestName === 'getUser' && mockName === 'scenario1')
            return new Response(JSON.stringify({ scenario1: true }));
          if (requestName === 'https://test.com') return new Response(JSON.stringify({ simple: true }));
          if (mockName === 'scenario3') return new Response(JSON.stringify({ scenario3: true }));
        },
      },
    });
    HttpsStore.setToken('main', '123');
    HttpsStore.setToken('second', '123');
    CacheStore.setCache([{ key: 'token-third', maxAge: 60, value: { token: '123' } }]);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   type KeysStartingWith<Set, Needle extends string> = Set extends `${Needle}${infer _X}` ? Set : never;
  // type PickByNotStartingWith<T, NotStartWith extends string> = Omit<T, KeysStartingWith<keyof T, NotStartWith>>;

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    restoreStorage();
    HttpsStore.reset();
    CacheStore.reset();
  });

  test('namedRequest: getUser should be success', async () => {
    const { response, dataJson, validation } = await HttpsStore.namedRequest('getUser', {
      id: 4,
      mockName: 'scenario2',
    });
    expect(dataJson).toEqual({ userId: 1 });
    expect(validation?.(dataJson, response)).toEqual(true);
    // if (validation?.(dataJson, response)) {
    //   const r = dataJson.userId;
    // }
    expect(response?.status).toEqual(200);
  });

  test('namedRequest: getUser3 should be success', async () => {
    const { response, dataJson } = await HttpsStore.namedRequest('getUser3');
    expect(dataJson).toEqual({ userId: 4 });
    expect(response?.status).toEqual(200);
  });

  test('namedRequest: getUser scenario1 should be success', async () => {
    const { response, dataJson } = await HttpsStore.namedRequest('getUser', { id: 4, mockName: 'scenario1' });
    expect(dataJson).toEqual({ scenario1: true });
    expect(response?.status).toEqual(200);
  });

  test('request: should be success', async () => {
    const { dataJson } = await HttpsStore.request('https://test.com');
    expect(dataJson).toEqual({ simple: true });
  });

  test('request: with mockName should be success', async () => {
    const { dataJson } = await HttpsStore.request('https://test.com/3', { mockName: 'scenario3' });
    expect(dataJson).toEqual({ scenario3: true });
  });

  test('namedRequest: getList with cached token third', async () => {
    const { response, dataJson } = await HttpsStore.namedRequest('getList');
    expect(dataJson).toEqual({ data: [] });
    expect(response?.status).toEqual(200);
  });

  test('loader: should be active', async () => {
    const { result, unmount } = renderHook(() => LoaderStore.useSubscribe((state) => state.active));
    expect(result.current).toEqual(false);
    act(() => {
      HttpsStore.namedRequest('getUser', { id: 4, mockName: 'scenario2' });
    });
    expect(result.current).toEqual(true);
    unmount();
  });
});

describe('https.hook useHttps:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    HttpsStore.initialize({
      settings: { mockMode: true },
      mocks: {
        additionalRules: ({ requestName }) => {
          if (requestName === 'https://test.com') return new Response(JSON.stringify({ simple: true }));
        },
      },
    });
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    HttpsStore.reset();
  });

  test('request: should make request', async () => {
    const { result, unmount } = renderHook(() => useHttps());
    let data;
    await act(async () => {
      const { dataJson } = await result.current.request('https://test.com');
      data = dataJson;
    });
    expect(data).toEqual({ simple: true });
    unmount();
  });
});

describe('https.hook useHttps named:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    HttpsStore.initialize({
      settings: { mockMode: true, waitToken: true },
      tokens: { main: { template: 'bearer' } },
      namedRequests: {
        getData: (): IHttpsRequest => ({
          url: 'https://test.com',
          tokenName: 'main',
        }),
      },
      mocks: {
        namedRequests: {
          getData: {
            body: { data: 'test' },
          },
        },
      },
    });
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    HttpsStore.reset();
  });

  test('request: should make request', async () => {
    const { result, unmount } = renderHook(() => useHttps());
    let data;
    await act(async () => {
      const [{ dataJson }] = await Promise.all([
        result.current.namedRequest('getData'),
        new Promise((res) => {
          HttpsStore.setToken('main', 'main_token');
          res(true);
        }),
      ]);
      data = dataJson;
    });
    expect(data).toEqual({ data: 'test' });
    unmount();
  });
});
