import { renderHook } from '@testing-library/react-hooks';

import { NeedsStore, IHttpsRequest, HttpsStore, useNeeds } from '..';
import mockResponse from '../../../__mocks__/response';

import { ScenariosStore } from '.';

type TUser = {
  name: string;
  id: number;
};
type TTask = {
  id: number;
  text: string;
};

declare module '../https' {
  interface IHttpsTokenNames {
    names: 'main';
  }
  interface IHttpsRequestsConfig {
    postAuth: [
      (props: { email: string; password: string }) => IHttpsRequest,
      { success: boolean; data: { token: string; user: TUser } },
      { error: string },
    ];
    getTasks: [() => IHttpsRequest, { success: boolean; data: TTask[] }, { error: string }];
    patchTask: [
      (props: { id: number; text: string }) => IHttpsRequest,
      { success: boolean; data: TTask },
      { error: string },
    ];
  }
}
declare module '../needs' {
  interface INeedsStoreConfig {
    profile: TUser | null;
    tasks: TTask[] | null;
  }
}

describe('ScenariosStore method:', () => {
  let restoreResponse: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
    HttpsStore.initialize({
      settings: { mockMode: true, waitToken: true, mockDelay: 0 },
      tokens: {
        main: { template: 'bearer' },
      },
      namedRequests: {
        postAuth: (props): IHttpsRequest => ({
          url: 'https://test.com',
          init: { method: 'POST' },
          body: props,
        }),
        getTasks: (): IHttpsRequest => ({
          url: 'https://test.com',
          init: { method: 'GET' },
          tokenName: 'main',
        }),
        patchTask: (props): IHttpsRequest => ({
          url: 'https://test.com',
          init: { method: 'PATCH' },
          body: props,
          tokenName: 'main',
        }),
      },
      mocks: {
        namedRequests: {
          postAuth: {
            body: { success: true, data: { token: '12345', user: { id: 1, name: 'Stive' } } },
          },
          getTasks: {
            body: {
              data: [
                { id: 1, text: 'text1' },
                { id: 2, text: 'text2' },
              ],
            },
          },
        },
        additionalRules({ input, init, mockName, requestName, options }) {
          if (requestName === 'patchTask' && options?.body?.id)
            return new Response(JSON.stringify({ success: true, data: options.body }));
        },
      },
    });

    NeedsStore.initialize({
      settings: { loader: false, waitRequest: false },
      store: {
        profile: null,
        tasks: null,
      },
      requests: {
        profile: ['postAuth', 'data'],
        tasks: ['getTasks', 'data'],
      },
    });

    ScenariosStore.initialize({
      afterRequest: {
        postAuth: ({ dataJson, valid }) => {
          if (valid) HttpsStore.setToken('main', dataJson.data.token);
        },
        patchTask: ({ dataJson, response, valid, input, init, options }) => {
          if (valid)
            NeedsStore.set(
              'tasks',
              (prev) => prev?.map((el) => (el.id === options?.body.id ? dataJson.data : el)) || null,
            );
        },
      },
      // needsDependsOn: {
      //   tasks: {
      //     patchTask: (setFn) => {
      //       setFn((prev) => prev?.map(el => el.id === id ? item : el) || null);
      //     },
      //   },
      // },
    });
  });

  afterAll(() => {
    restoreResponse();
    HttpsStore.reset();
    NeedsStore.reset();
    ScenariosStore.reset();
  });

  test('should make auth', async () => {
    const { dataJson } = await HttpsStore.namedRequest('postAuth', { email: 'test@mail.ru', password: '123' });
    ScenariosStore.after('postAuth');

    expect(dataJson?.data).toEqual({ token: '12345', user: { id: 1, name: 'Stive' } });
    expect(HttpsStore.state().tokens?.main.token).toEqual('12345');
  });

  test('should make update tasks list', async () => {
    // const { result, unmount } = renderHook(() => NeedsStore.useSubscribe((state) => state.store));
    const { result, unmount, rerender } = renderHook(() => useNeeds(['tasks']));

    await new Promise((res) => {
      setTimeout(() => {
        rerender();
        res(true);
      }, 1000);
    });
    expect(result.current?.store?.tasks?.length).toEqual(2);

    const { dataJson } = await HttpsStore.namedRequest('patchTask', { id: 1, text: 'updated' });
    expect(dataJson?.data).toEqual({ id: 1, text: 'updated' });

    ScenariosStore.after('patchTask');
    expect(result.current?.store?.tasks).toEqual([
      { id: 1, text: 'updated' },
      { id: 2, text: 'text2' },
    ]);
    unmount();
  });
});
