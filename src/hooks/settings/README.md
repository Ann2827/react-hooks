# Settings hook

[comment]: <> (description)

[comment]: <> (image)

[Back](https://github.com/Ann2827/library-react-hooks/blob/main/README.md)

## Table of Contents

- [Usage](#usage)
- [Properties](#properties)
- [Demo](https://ann2827.github.io/library-react-hooks/settings)

## Usage <a name = "usage"></a>

Place for message dispatch:

```tsx
import React from 'react';
import { useSettings } from 'library-react-hooks';

const Example: React.VFC = () => {
  const { } = useSettings();

  return (
    <div>

    </div>
  );
};
```

Settings component:

```tsx
import React from 'react';
import { useSettings } from 'library-react-hooks';

const Settings: React.VFC = () => {
  const { } = useSettings();

  return <div></div>;
};
```

## Properties <a name = "properties"></a>

### Set Once `settingsSettings`

```ts
settingsSettings({ ... });
```

| name | type | default | what`s doing |
| ------ | ------ | ------ | ------ |
|  |  |  |  |
