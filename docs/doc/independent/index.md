# Самостоятельное использование

Хуками и методами можно пользоваться без инициализации хранилищ.

## Комбинация http - loader - notifications

```typescript
import React from 'react';
import { useHttps, useLoader, useNotifications } from 'library-react-hooks';

const MyPage: React.FC = () => {
    const { request } = useHttps();
    const { loaderOn, loaderOff } = useLoader();
    const { send } = useNotifications();

    const [list, setList] = React.useState([]);

    const getList = React.useCallback(async () => {
        loaderOn();
        const { response, dataJson } = await request('https://test.com', { method: 'GET', query: { page: 1 }, token: 'x-auth:Bearer 123-token-456' });
        if (response.ok && dataJson?.success && dataJson?.data && Array.isArray(dataJson.data)) {
            setList(dataJson.data);
        } else {
            send({ data: { title: 'Something went wrong', text: response.statusText }, sticky: true });
        }
        loaderOff();
    }, [request, loaderOn, loaderOff, send]);

    return (
        <div>
            <h1>My Page</h1>
            <button onClick={getList}>Request</button>
            <ul>
                {list.map((item, id) => <li key={id}>{item}</li>)}
            </ul>
        </div>
    );
};

```

Этот код может быть меньше, если настроить конфигурацию. Особенно актуально, если этот же запрос будет использоваться на других страница (можно избежать дублирования кода и излишних повторных запросов, если данные были получены ранее) или если много параметров.
См. раздел combo
