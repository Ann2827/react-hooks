import { HttpsStore, type IHttpsRequest } from 'library-react-hooks';

type TError = { errorCode: number } | { _meta: Record<string, unknown> };
declare module 'library-react-hooks' {
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

HttpsStore.initialize({
  settings: { mockMode: true, waitToken: true },
  tokens: {
    main: 'bearer',
    second: 'x-auth:Bearer ${token}',
  },
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
    namedRequests: {
      getUser: {
        body: { userId: 1 },
      },
      getUser3: {
        body: { userId: 3 },
      },
    },
    additionalRules: ({ requestName, mockName }) => {
      if (requestName === 'getUser3') return new Response(JSON.stringify({ userId: 4 }));
      if (requestName === 'getUser' && mockName === 'scenario1')
        return new Response(JSON.stringify({ scenario1: true }));
      if (requestName === 'https://test.com') return new Response(JSON.stringify({ simple: true }));
      if (mockName === 'scenario3') return new Response(JSON.stringify({ scenario3: true }));
      return new Response();
    },
  },
});
