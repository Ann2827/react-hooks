# Needs hook

[comment]: <> (description)

[comment]: <> (image)

[Back](https://github.com/Ann2827/library-react-hooks/blob/main/README.md)

## Table of Contents

- [Usage](#usage)
- [Properties](#properties)
- [Demo](https://ann2827.github.io/library-react-hooks/needs)

## Usage <a name = "usage"></a>

Place for message dispatch:

```tsx
import React from 'react';
import { useNeeds } from 'library-react-hooks';

const Example: React.VFC = () => {
  const { } = useNeeds();

  return (
    <div>

    </div>
  );
};
```

Needs component:

```tsx
import React from 'react';
import { useNeeds } from 'library-react-hooks';

const Needs: React.VFC = () => {
  const { } = useNeeds();

  return <div></div>;
};
```

## Properties <a name = "properties"></a>

### Set Once `needsSettings`

```ts
needsSettings({ ... });
```

| name | type | default | what`s doing |
| ------ | ------ | ------ | ------ |
|  |  |  |  |
