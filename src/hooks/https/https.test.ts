import { act, renderHook } from '@testing-library/react-hooks';

import mockResponse from '../../../__mocks__/response';
import mockFetch from '../../../__mocks__/fetch';

import { useHttps, HttpsStore, IHttpsRequest } from '.';

type TError = { errorCode: number } | { _meta: Record<string, unknown> };
declare module '..' {
  interface IHttpsTokenNames {
    names: 'main' | 'second';
  }
  interface IHttpsMockNames {
    names: 'scenario1' | 'scenario2' | 'scenario3';
  }
  interface IHttpsRequestsConfig {
    getUser: [
      (arg: { id: number; mockName: IHttpsMockNames['names'] }) => IHttpsRequest,
      { data: { name: string } } | TError,
    ];
    getUser3: [() => IHttpsRequest, { data: { name: string } } | TError];
  }
}

describe('https HttpsStore:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    HttpsStore.initialize({
      settings: { loader: true, messages: true, mockMode: true, waitToken: true },
      tokens: {
        main: 'bearer',
        second: 'x-auth:Bearer ${token}',
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
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    HttpsStore.reset();
  });

  test('namedRequest: getUser should be success', async () => {
    const { response, dataJson } = await HttpsStore.namedRequest('getUser', { id: 4, mockName: 'scenario2' });
    expect(dataJson).toEqual({ userId: 1 });
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
      tokens: { main: 'bearer' },
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
