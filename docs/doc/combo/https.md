# Https Store

## Настройка

Создайте файл `src/api/index.ts` и подключите его в `src/index.tsx` через `import './api'`

```ts
import { HttpsStore } from 'library-react-hooks';

HttpsStore.initialize({
      settings: { loader: true, messages: true, mockMode: true, waitToken: true },
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
        },
      },
    });
```