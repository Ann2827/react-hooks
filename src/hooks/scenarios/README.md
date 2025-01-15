# Scenarios hook

[comment]: <> (description)

[comment]: <> (image)

[Back](https://github.com/Ann2827/library-react-hooks/blob/main/README.md)

## Table of Contents

- [Usage](#usage)
- [Properties](#properties)
- [Demo](https://ann2827.github.io/library-react-hooks/scenarios)

## Usage <a name = "usage"></a>

Place for message dispatch:

```tsx
import React from 'react';
import { useScenarios } from 'library-react-hooks';

const Example: React.VFC = () => {
  const { } = useScenarios();

  return (
    <div>

    </div>
  );
};
```

Scenarios component:

```tsx
import React from 'react';
import { useScenarios } from 'library-react-hooks';

const Scenarios: React.VFC = () => {
  const { } = useScenarios();

  return <div></div>;
};
```

## Properties <a name = "properties"></a>

### Set Once `scenariosSettings`

```ts
scenariosSettings({ ... });
```

| name | type | default | what`s doing |
| ------ | ------ | ------ | ------ |
|  |  |  |  |
