# Cache hook

[comment]: <> (description)

[comment]: <> (image)

[Back](https://github.com/Ann2827/library-react-hooks/blob/main/README.md)

## Table of Contents

- [Usage](#usage)
- [Properties](#properties)
- [Demo](https://ann2827.github.io/library-react-hooks/cache)

## Usage <a name = "usage"></a>

Place for message dispatch:

```tsx
import React from 'react';
import { useCache } from 'library-react-hooks';

const Example: React.VFC = () => {
  const { } = useCache();

  return (
    <div>

    </div>
  );
};
```

Cache component:

```tsx
import React from 'react';
import { useCache } from 'library-react-hooks';

const Cache: React.VFC = () => {
  const { } = useCache();

  return <div></div>;
};
```

## Properties <a name = "properties"></a>

### Set Once `cacheSettings`

```ts
cacheSettings({ ... });
```

| name | type | default | what`s doing |
| ------ | ------ | ------ | ------ |
|  |  |  |  |
