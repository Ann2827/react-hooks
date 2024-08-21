# Notifications hook

[comment]: <> (description)

[comment]: <> (image)

[Back](https://github.com/Ann2827/library-react-hooks/blob/main/README.md)

## Table of Contents

- [Usage](#usage)
- [Properties](#properties)
- [Demo](https://ann2827.github.io/library-react-hooks/notifications)

## Usage <a name = "usage"></a>

Place for message dispatch:

```tsx
import React from 'react';
import { useNotifications } from 'library-react-hooks';

const Example: React.VFC = () => {
  const { } = useNotifications();

  return (
    <div>

    </div>
  );
};
```

Notifications component:

```tsx
import React from 'react';
import { useNotifications } from 'library-react-hooks';

const Notifications: React.VFC = () => {
  const { } = useNotifications();

  return <div></div>;
};
```

## Properties <a name = "properties"></a>

### Set Once `notificationsSettings`

```ts
notificationsSettings({ ... });
```

| name | type | default | what`s doing |
| ------ | ------ | ------ | ------ |
|  |  |  |  |
