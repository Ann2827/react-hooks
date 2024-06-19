# Messages hook

[comment]: <> (description)

[comment]: <> (image)

[Back](https://github.com/Ann2827/library-react-hooks/blob/main/README.md)

## Table of Contents

- [Usage](#usage)
- [Properties](#properties)
- [Demo](https://ann2827.github.io/library-react-hooks/messages)

## Usage <a name = "usage"></a>

Place for message dispatch:

```tsx
import React from 'react';
import { useMessages } from 'library-react-hooks';

const Example: React.VFC = () => {
  const { } = useMessages();

  return (
    <div>

    </div>
  );
};
```

Messages component:

```tsx
import React from 'react';
import { useMessages } from 'library-react-hooks';

const Messages: React.VFC = () => {
  const { } = useMessages();

  return <div></div>;
};
```

## Properties <a name = "properties"></a>

### Set Once `messagesSettings`

```ts
messagesSettings({ ... });
```

| name | type | default | what`s doing |
| ------ | ------ | ------ | ------ |
|  |  |  |  |
