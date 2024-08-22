# Https

## `useHttps`

```typescript
import React from 'react';
import { useHttps } from 'library-react-hooks';

const MyPage: React.FC = () => {
    const { request } = useHttps();

    const getList = React.useCallback(async () => {
        const { response, dataJson } = await request('https://test.com', { method: 'GET', query: { page: 1 }, token: 'x-auth:Bearer 123-token-456' });
        if (response.ok) {

        }
    }, [request]);

    return (
        <div>
            <h1>My Page</h1>
            <button onClick={getList}>Request</button>
        </div>
    );
};

```

## `HttpsStore`
