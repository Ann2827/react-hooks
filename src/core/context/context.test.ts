import { act } from '@testing-library/react-hooks';

// TODO: потестить
// 123 eslint-disable-next-line jest/no-mocks-import
import mockConsole from '../../../__mocks__/console';

import createContext, { CreateContext } from './context.functions';
import { IContext, TContextFn } from './context.types';

describe('context CreateContext class:', () => {
  type TState = {
    key1: string;
    key2: string;
  };
  let initialState: TState;
  let KeysContext: CreateContext<TState>;
  beforeAll(() => {
    initialState = { key1: '', key2: '' };
    KeysContext = new CreateContext<TState>(initialState);
  });

  beforeEach(() => {
    KeysContext.reset();
  });

  test('should have methods', () => {
    expect(Object.keys(KeysContext).sort()).toEqual(['on', 'reset', '_test', 'getState', 'logs'].sort());
    expect(typeof KeysContext.state).toEqual('object');
    expect(typeof KeysContext._test).toEqual('function');
  });

  test('should work test method', () => {
    expect(KeysContext._test<TState>('state')).toEqual(initialState);
    expect(KeysContext._test<Array<TContextFn<TState>>>('listeners')).toEqual([]);
  });

  test('should update state', () => {
    expect(KeysContext._test<Array<TContextFn<TState>>>('listeners')).toEqual([]);
    expect(KeysContext.state).toEqual(initialState);

    // @ts-ignore
    let on: [TState, TState] = [];
    act(() => {
      KeysContext.on((prev, next) => {
        on = [prev, next];
      });
    });
    expect(KeysContext._test<Array<TContextFn<TState>>>('listeners')?.length).toEqual(1);
    expect(on.length).toEqual(0);

    const state1 = { key1: '1', key2: '' };
    act(() => {
      KeysContext.state = state1;
    });
    expect(KeysContext.state).toEqual(state1);
    expect(on).toEqual([initialState, state1]);

    const state2 = { key1: '2', key2: '1' };
    act(() => {
      KeysContext.state = state2;
    });
    expect(KeysContext.state).toEqual(state2);
    expect(on).toEqual([state1, state2]);

    const state3 = { key1: '2', key2: '2' };
    act(() => {
      KeysContext.state = state3;
    });
    expect(KeysContext.state).toEqual(state3);
    expect(on).toEqual([state2, state3]);

    let beCalled = false;
    act(() => {
      KeysContext.on(() => {
        beCalled = true;
      });
      KeysContext.state = state3;
    });
    expect(KeysContext._test<Array<TContextFn<TState>>>('listeners')?.length).toEqual(2);
    expect(beCalled).toEqual(false);
  });

  test('should be independence', () => {
    const KeysContext2 = new CreateContext(initialState);

    const state1 = { key1: '1', key2: '' };
    act(() => {
      KeysContext2.state = state1;
    });
    expect(KeysContext.state).not.toEqual(KeysContext2.state);
    expect(KeysContext2.state).toEqual(state1);
  });

  test('should listen on', () => {
    expect(KeysContext.state).toEqual(initialState);

    // @ts-ignore
    let on: [TState, TState] = [];
    KeysContext.on((prev, next) => {
      on = [prev, next];
    });

    const state1 = { key1: '1', key2: '' };
    act(() => {
      KeysContext.state = state1;
    });
    expect(on).toEqual([initialState, state1]);
  });
});

describe('context CreateContext class options:', () => {
  test('should send logs', () => {
    const KeysContext = new CreateContext({ key: '' }, { logger: true, hookName: '' });
    const restoreConsole = mockConsole('info');

    act(() => {
      KeysContext.state = { key: '1' };
    });
    expect(console.info).toHaveBeenCalled();
    restoreConsole();
  });

  test('shouldn`t clean keys', () => {
    const KeysContext = new CreateContext({ key: '' }, { cleanKeys: false });

    const state1 = { key: '1', key1: '1' };
    act(() => {
      // @ts-ignore
      KeysContext.state = state1;
    });
    expect(KeysContext.state).toEqual(state1);
  });

  test('should clean keys', () => {
    const KeysContext = new CreateContext({ key: '' }, { cleanKeys: true });

    act(() => {
      // @ts-ignore
      KeysContext.state = { key: '1', key1: '1' };
    });
    expect(KeysContext.state).toEqual({ key: '1' });
  });

  test('should merge keys', () => {
    const KeysContext = new CreateContext({ key: '' }, { cleanKeys: false, merge: true });

    const state1 = { key: '1', key1: '1' };
    act(() => {
      // @ts-ignore
      KeysContext.state = state1;
    });
    expect(KeysContext.state).toEqual(state1);
  });
});

describe('context createContext:', () => {
  type TState = {
    key1: string;
    key2: string;
  };
  let initialState: TState;
  let KeysContext: IContext<TState>;
  beforeAll(() => {
    initialState = { key1: '', key2: '' };
    KeysContext = createContext<TState>(initialState);
  });

  beforeEach(() => {
    KeysContext.reset();
  });

  test('should have methods', () => {
    expect(Object.keys(KeysContext).sort()).toEqual(['on', 'reset', 'getState', 'logs'].sort());
    expect(typeof KeysContext.state).toEqual('object');
  });

  test('should update state', () => {
    expect(KeysContext.state).toEqual(initialState);

    const state1 = { key1: '1', key2: '' };
    act(() => {
      KeysContext.state = state1;
    });
    expect(KeysContext.state).toEqual(state1);
  });

  test('should listen on', () => {
    expect(KeysContext.state).toEqual(initialState);

    // @ts-ignore
    let on: [TState, TState] = [];
    KeysContext.on((prev, next) => {
      on = [prev, next];
    });

    const state1 = { key1: '1', key2: '' };
    act(() => {
      KeysContext.state = state1;
    });
    expect(on).toEqual([initialState, state1]);
  });
});
