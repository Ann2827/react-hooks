import { act, renderHook } from '@testing-library/react-hooks';

import { useNeeds } from '.';

describe('needs.hook function:', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useNeeds());
    act(() => result.current.reset());
  });

  test('useNeeds: should make action', () => {
    const { result, unmount } = renderHook(() => useNeeds());
    act(() => result.current.action());
    expect(result.current.counter).toEqual(1);
    unmount();
  });
});
