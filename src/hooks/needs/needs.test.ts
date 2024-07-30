import { renderHook, act } from '@testing-library/react-hooks';

import { useNeeds, NeedsStore, IHttpsRequest, HttpsStore } from '..';
import mockResponse from '../../../__mocks__/response';

declare module '..' {
  interface INeedsStoreConfig {
    user: {
      id: number | null;
    };
    sessions: null | [];
  }
  // TODO: не работает
  interface IHttpsRequestsConfig {
    getSessions: [() => IHttpsRequest, { data: [] }];
  }
}

describe('needs.hook function:', () => {
  let restoreResponse: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    HttpsStore.initialize({
      settings: { mockMode: true, waitToken: true },
      tokens: {
        main: 'bearer',
        second: '1111',
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
      settings: { loader: true },
      store: {
        user: {
          id: null,
        },
        sessions: null,
      },
      // TODO: add validators
      requests: {
        user: 'getUser3',
        sessions: ['getSessions', 'data'],
      },
    });
  });

  afterAll(() => {
    restoreResponse();
    HttpsStore.reset();
    NeedsStore.reset();
  });

  // beforeEach(() => {
  //   const { result } = renderHook(() => useNeeds([]));
  //   act(() => result.current.reset());
  // });

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
});
