import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { useStoredValue } from '.';

describe('helper.hook function:', () => {
  test('useStoredValue: should be renderer', () => {
    let renderCounter = 0;
    const { rerender, unmount } = renderHook(() => {
      const stored = useStoredValue(['test']);
      React.useEffect(() => {
        if (stored) renderCounter = renderCounter + 1;
      }, [stored]);
    });
    rerender();
    unmount();
    expect(renderCounter).toEqual(1);
  });
});
