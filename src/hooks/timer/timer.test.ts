import { act, renderHook } from '@testing-library/react-hooks';

import { TimerStore, useTimer } from '.';

describe('timer.hook TimerStore:', () => {
  afterEach(() => {
    TimerStore.reset();
  });

  test('setTimer: should be start', () => {
    const name = 'myTimer';
    TimerStore.setTimer(5, { name });
    expect(TimerStore.getTime(name)).toBeGreaterThan(0);
  });

  test('cancelTimer: should be canceled', () => {
    const name = 'myTimer';
    TimerStore.setTimer(5, { name });
    TimerStore.cancelTimer(name);
    expect(TimerStore.getTime(name)).toEqual(0);
  });

  test('setTimer: should be finished', async () => {
    const name = 'myTimer';
    TimerStore.setTimer(3, { name });
    await new Promise((res) => {
      setTimeout(() => {
        res(true);
      }, 4000);
    });
    expect(TimerStore.getTime(name)).toEqual(0);
  });

  test('setTimer: should be finished in useSubscribe', async () => {
    const { result, rerender, unmount } = renderHook(() => TimerStore.useSubscribe((state) => state.time));
    const name = 'myTimer';
    act(() => {
      TimerStore.setTimer(3, { name });
    });
    await new Promise((res) => {
      setTimeout(() => {
        res(true);
        rerender();
      }, 4000);
    });
    expect(result.current).toEqual({ [name]: 0 });
    unmount();
  });
});

describe('timer.hook hook:', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTimer());
    result.current.reset();
  });

  test('useTimer: should be start', () => {
    const name = 'myTimer';
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.setTimer(5, { name });
    });
    expect(result.current.getTime(name)).toBeGreaterThan(0);
  });

  test('useTimer: should be canceled', () => {
    const name = 'myTimer';
    const { result } = renderHook(() => useTimer());
    act(() => {
      result.current.setTimer(5, { name });
      result.current.cancelTimer(name);
    });
    expect(result.current.getTime(name)).toEqual(0);
  });
});
