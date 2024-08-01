import { act, renderHook } from '@testing-library/react-hooks';

import { useLoader } from '.';

describe('loader.hook function:', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useLoader());
    act(() => result.current.reset());
  });

  test('useLoader: should be active', () => {
    const { result, unmount } = renderHook(() => useLoader());
    act(() => result.current.loaderOn());
    expect(result.current.active).toEqual(true);
    unmount();
  });

  test('useLoader: should be canceled', () => {
    const { result, unmount } = renderHook(() => useLoader());
    act(() => {
      result.current.loaderOn();
      result.current.loaderOff();
    });
    expect(result.current.active).toEqual(false);
    unmount();
  });

  test('useLoader: should be stopped', () => {
    const { result, unmount } = renderHook(() => useLoader());
    act(() => {
      result.current.loaderOn();
      result.current.loaderOn();
      result.current.loaderOn();
      result.current.loaderStop();
    });
    expect(result.current.active).toEqual(false);
    unmount();
  });

  // test('useLoader: should be listen on', () => {
  //   const { result, unmount } = renderHook(() => useLoader());
  //   let state = false;
  //   act(() => {
  //     result.current.on((is) => {
  //       state = is;
  //     });
  //     result.current.loaderOn();
  //   });
  //   expect(state).toEqual(true);
  //   unmount();
  // });

  test('useLoader: should be determinated', () => {
    const { result, unmount } = renderHook(() => useLoader());
    act(() => {
      result.current.loaderOn();
      result.current.loaderOn();
      result.current.loaderOn();
      result.current.loaderOff();
    });
    expect(result.current.active).toEqual(true);
    unmount();
  });
});
