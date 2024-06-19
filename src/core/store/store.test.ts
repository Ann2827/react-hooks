import { act, renderHook } from '@testing-library/react-hooks';

import { createContext } from '../context';

import { makeSubscribe, makeSetState, makeStore } from './store.functions';
import { TStoreEnrich } from './store.types';

describe('makeSubscribe hook:', () => {
  type TState = { counter: number };
  const CounterContext = createContext<TState>({ counter: 0 });
  const useSubscribe = makeSubscribe<TState>(CounterContext);

  beforeEach(() => {
    CounterContext.reset();
  });

  test('should subscribe', () => {
    const { result, unmount } = renderHook(() => useSubscribe<number>((state) => state.counter));
    expect(result.current).toEqual(0);
    act(() => {
      CounterContext.state = { counter: 1 };
    });
    expect(result.current).toEqual(1);
    unmount();
  });
});

describe('makeSetState hook:', () => {
  type TState = { counter: number };
  const CounterContext = createContext<TState>({ counter: 0 });
  const setState = makeSetState<TState>(CounterContext);

  beforeEach(() => {
    CounterContext.reset();
  });

  test('should set state', () => {
    expect(CounterContext.state.counter).toEqual(0);
    setState((state) => ({ ...state, counter: state.counter + 1 }));
    // TODO:
    // setState({ counter: 1 });
    expect(CounterContext.state.counter).toEqual(1);
  });
});

describe('makeStore hook:', () => {
  type TCounterState = {
    counter: number;
    actions: {
      started: boolean;
      updated: boolean;
    };
  };
  type TCounterData = {
    __new(): TCounterData;
    _setStarted(): void;
    setCounter(): void;
  };
  let CounterStore: TStoreEnrich<TCounterState, TCounterData>;

  beforeAll(() => {
    CounterStore = makeStore<TCounterState>(
      { counter: 0, actions: { started: false, updated: false } },
      {
        logger: false,
        hookName: 'counter',
      },
    ).enrich<TCounterData>((setState) =>
      ({
        __new() {
          this.setCounter = this.setCounter.bind(this);
          return this;
        },
        _setStarted() {
          setState((prev) => ({ ...prev, actions: { ...prev.actions, started: true } }));
        },
        setCounter() {
          this._setStarted();
          setState((prev) => ({ ...prev, counter: prev.counter + 1 }));
        },
      }).__new(),
    );
  });

  beforeEach(() => {
    CounterStore.reset();
  });

  test('should be available methods', () => {
    expect(Object.keys(CounterStore).sort()).toEqual(['setCounter', 'reset', 'useSubscribe', 'setState', 'on'].sort());
  });

  test('subscribe to counter', () => {
    const { result, unmount } = renderHook(() => CounterStore.useSubscribe<number>((state) => state.counter));
    expect(result.current).toEqual(0);
    unmount();
  });

  test('subscribe by nested key', () => {
    const { result, unmount } = renderHook(() => CounterStore.useSubscribe((state) => state.actions.started));
    expect(result.current).toEqual(false);
    unmount();
  });

  test('make setCounter', () => {
    const { result, unmount } = renderHook(() => CounterStore.useSubscribe<number>((state) => state.counter));
    act(() => CounterStore.setCounter());
    expect(result.current).toEqual(1);
    unmount();
  });

  test('make async setCounter', async () => {
    const { result, unmount } = renderHook(() => CounterStore.useSubscribe<number>((state) => state.counter));
    act(() => CounterStore.setCounter());
    expect(result.current).toEqual(1);
    await act(async () => {
      await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          CounterStore.setCounter();
          CounterStore.setCounter();
          expect(result.current).toEqual(3);
          resolve(true);
        }, 2000);
      });
    });
    expect.assertions(2);
    unmount();
  });

  test('make setState object', () => {
    const { result, unmount } = renderHook(() => CounterStore.useSubscribe((state) => state.actions));
    expect(result.current).toEqual({ started: false, updated: false });
    act(() => CounterStore.setCounter());
    expect(result.current).toEqual({ started: true, updated: false });
    unmount();
  });
});
