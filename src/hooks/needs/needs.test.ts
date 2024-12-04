import { renderHook, act } from '@testing-library/react-hooks';

import { useNeeds, NeedsStore, IHttpsRequest, HttpsStore, CacheStore } from '..';
import mockResponse from '../../../__mocks__/response';
import mockStorage from '../../../__mocks__/storage';

declare module '..' {
  interface INeedsStoreConfig {
    user: {
      id: number | null;
    };
    sessions: null | [];
    cache: { id: number } | null;
  }
  // TODO: не работает
  interface IHttpsRequestsConfig {
    getSessions: [() => IHttpsRequest, { data: [] }];
  }
}

describe('needs.hook function:', () => {
  let restoreResponse: () => void;
  let restoreStorage: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreStorage = mockStorage();
    HttpsStore.initialize({
      settings: { mockMode: true, waitToken: true },
      tokens: {
        main: { template: 'bearer' },
        second: { template: '1111' },
        third: { template: '123' },
      },
      // TODO: add settings response when fetch was catch
      // TODO: add messages settings но не сюда, а по имени реквеста проверять в том хуке
      namedRequests: {
        getUser: ({ id = 1 }): IHttpsRequest => ({
          url: 'https://test.com',
          query: { id },
          tokenName: 'main',
        }),
        getUser3: (): IHttpsRequest => ({
          url: 'https://test.com/2',
          query: { id: 3 },
          token: 'ssss',
        }),
        getSessions: (): IHttpsRequest => ({
          url: 'https://test.com/3',
          tokenName: 'main',
        }),
      },
      mocks: {
        namedRequests: {
          getUser3: {
            body: { id: 1 },
          },
          getSessions: {
            body: { data: [] },
          },
        },
      },
    });
    HttpsStore.setToken('main', '123');

    NeedsStore.initialize({
      // TODO: add validate for cache and https
      settings: { loader: true, waitRequest: false },
      store: {
        user: {
          id: null,
        },
        sessions: null,
        cache: null,
      },
      // TODO: add validators
      requests: {
        user: 'getUser3',
        sessions: ['getSessions', 'data'],
        cache: 'getUser3',
      },
      cache: {
        cache: { time: 10, clean: { otherResponse: { which: 'token', token: 'main', is: false } } },
      },
      rules: ({ request, response, dataJsonFormat, args }) => {
        if (
          request === 'sessions2' &&
          dataJsonFormat &&
          typeof dataJsonFormat === 'object' &&
          'data' in dataJsonFormat
        ) {
          return { test: dataJsonFormat.data };
        }
      },
    });
  });

  afterAll(() => {
    restoreResponse();
    restoreStorage();
    HttpsStore.reset();
    NeedsStore.reset();
    CacheStore.reset();
  });

  test('useNeeds: should make request', async () => {
    const { result, unmount, rerender } = renderHook(() => useNeeds(['user']));
    await new Promise((res) => {
      setTimeout(() => {
        rerender();
        res(true);
      }, 4000);
    });

    expect(result.current?.state?.user).toEqual(true);
    expect(result.current?.store?.user).toEqual({ id: 1 });
    unmount();
  });

  test('useNeeds: should make request with args', async () => {
    const { result, unmount } = renderHook(() => useNeeds([['user', '123456']]));
    let user = null;
    await act(async () => {
      await new Promise((res) => {
        setTimeout(() => {
          user = result.current.store?.user;
          res(true);
        }, 4000);
      });
    });

    expect(user).toEqual({ id: 1 });
    unmount();
  });

  test('useNeeds: should make restore cache', () => {
    window.localStorage.setItem(
      'cache-cache',
      JSON.stringify({ maxAge: new Date(Date.now() + 1000 * 60 * 10).getTime(), value: { id: 5 } }),
    );
    const { result, unmount } = renderHook(() => useNeeds(['cache']));

    expect(result.current?.store?.cache).toEqual({ id: 5 });
    window.localStorage.removeItem('cache-cache');
    unmount();
  });
});
