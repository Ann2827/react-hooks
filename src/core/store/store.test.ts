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
    act(() => {
      CounterContext.state = { counter: 1 };
    });
    const { result, unmount } = renderHook(() => useSubscribe<number>((state) => state.counter));
    expect(result.current).toEqual(1);
    act(() => {
      CounterContext.state = { counter: 2 };
    });
    expect(result.current).toEqual(2);
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
      listened: boolean;
    };
  };
  type TCounterData = {
    __new(): TCounterData;
    _setStarted(): void;
    _listenCount(): void;
    setCounter(): void;
    getState(): number;
    wait(count: number): Promise<number>;
  };
  let CounterStore: TStoreEnrich<TCounterState, TCounterData>;

  beforeAll(() => {
    CounterStore = makeStore<TCounterState>(
      { counter: 0, actions: { started: false, updated: false, listened: false } },
      {
        logger: false,
        hookName: 'counter',
      },
    ).enrich<TCounterData>((setState, { state, on }) =>
      ({
        __new() {
          this.setCounter = this.setCounter.bind(this);
          return this;
        },
        _setStarted() {
          setState((prev) => ({ ...prev, actions: { ...prev.actions, started: true } }));
        },
        _listenCount() {
          on((_prevState, newState) => {
            if (newState.counter === 5) {
              setState((prev) => ({ ...prev, actions: { ...prev.actions, listened: true } }));
            }
          });
        },
        setCounter() {
          this._setStarted();
          this._listenCount();
          setState((prev) => ({ ...prev, counter: prev.counter + 1 }));
        },
        getState() {
          return state().counter;
        },
        wait(c: number) {
          return new Promise<number>((res) => {
            const clean = on((_prevState, newState) => {
              if (newState.counter === c) {
                clean();
                res(c);
              }
            });
          });
        },
      }).__new(),
    );
  });

  beforeEach(() => {
    CounterStore.reset();
  });

  test('should be available methods', () => {
    expect(Object.keys(CounterStore).sort()).toEqual(
      ['setCounter', 'reset', 'useSubscribe', 'setState', 'on', 'getState', 'wait', 'logs', 'state', 'restart'].sort(),
    );
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
    expect(result.current).toEqual({ started: false, updated: false, listened: false });
    act(() => CounterStore.setCounter());
    expect(result.current).toEqual({ started: true, updated: false, listened: false });
    unmount();
  });

  test('make enrich state and on', () => {
    const { result, unmount } = renderHook(() => CounterStore.useSubscribe((state) => state.actions));
    expect(result.current.listened).toEqual(false);
    let count = 0;
    act(() => {
      CounterStore.setCounter();
      CounterStore.setCounter();
      CounterStore.setCounter();
      CounterStore.setCounter();
      CounterStore.setCounter();
      count = CounterStore.getState();
    });
    expect(count).toEqual(5);
    expect(result.current.listened).toEqual(true);
    unmount();
  });

  test('make wait', async () => {
    let count = 0;
    let wait = null;
    act(() => {
      CounterStore.setCounter();
      CounterStore.setCounter();
      count = CounterStore.getState();
    });
    expect(count).toEqual(2);
    await act(async () => {
      const [c] = await Promise.all([
        CounterStore.wait(3),
        new Promise((res) => {
          CounterStore.setCounter();
          res(true);
        }),
      ]);
      wait = c;
    });
    expect(wait).toEqual(3);
  });

  test('make useSubscribe updatable', async () => {
    let renderCount = 0;
    let counter = 0;
    const { unmount } = renderHook(() => {
      counter = CounterStore.useSubscribe((state) => state.counter);
      renderCount = renderCount + 1;
    });

    act(() => {
      CounterStore.setCounter();
    });

    expect(renderCount).toEqual(2);
    expect(counter).toEqual(1);
    unmount();
  });
});
