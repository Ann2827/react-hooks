# Инициализация хранилищ и комбинации

## Комбинация http - loader - notifications

```typescript
import React from 'react';
import { useHttps } from 'library-react-hooks';

const MyPage: React.FC = () => {
    const { namedRequest } = useHttps();

    const [list, setList] = React.useState([]);

    const getList = React.useCallback(async () => {
        // Запустится loader, запрос выполнится с token и прочими сохраненными параметрами
        const { response, dataJson } = await namedRequest('getList', { page: 1 });
        if (response.ok && dataJson?.success && dataJson?.data && Array.isArray(dataJson.data)) {
            setList(dataJson.data);
        } // При ошибке отправится notification
        // Остановится loader
    }, [namedRequest]);

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

или даже так

```typescript
import React from 'react';
import { useNeeds } from 'library-react-hooks';

const MyPage: React.FC = () => {
    const { store, state } = useNeeds([['getList', 1]]);

    return (
        <div>
            <h1>My Page</h1>
            <button onClick={getList}>Request</button>
            {!state.list ? (
                <p>Список пуст</p>
            ) : (
                <ul>
                    {store.list.map((item, id) => <li key={id}>{item}</li>)}
                </ul>
            )}
        </div>
    );
};

```
