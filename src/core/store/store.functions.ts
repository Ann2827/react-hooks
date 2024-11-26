import React from 'react';
import { onlyPublic, TOnlyPublic } from '@utils';

import { createContext, IContextOptions, IContext } from '../context';
// import { makeEffectOn } from '../helper';

import { TDataState, IStore, IStoreStateFn, TStoreEnrich, TStoreEnrichMethods } from './store.types';

// const useSubscribe2 = <S extends TDataState = {}, T = unknown>(Context: IContext<S>, listener: (state: S) => T): T => {
//   const refListener = React.useRef(listener);
//   const [state, setNewState] = React.useState<T>(refListener.current(Context.state));
//   React.useEffect(() => {
//     const clean = Context.on((prev, next) => {
//       const nextState = refListener.current(next);
//       if (JSON.stringify(refListener.current(prev)) !== JSON.stringify(nextState)) {
//         setNewState(nextState);
//       }
//     });

//     return () => {
//       clean();
//     };
//   }, []);
//   return state;
// };

// TODO: see reselect lib
export const makeSubscribe = <S extends TDataState = {}>(Context: IContext<S>): IStore<S>['useSubscribe'] => {
  const on = Context.on;

  return <T = unknown>(listener: (state: S) => T): T => {
    const refListener = React.useRef(listener);
    const [state, setNewState] = React.useState<T>(() => refListener.current(Context.state));

    React.useEffect(() => {
      const clean = on((prev, next) => {
        const nextState = refListener.current(next);
        if (JSON.stringify(refListener.current(prev)) !== JSON.stringify(nextState)) {
          setNewState(nextState);
        }
      });

      return clean;
    }, []);
    return state;
  };
};

export const makeSetState = <S extends TDataState = {}>(Context: IContext<S>): ((fn: IStoreStateFn<S>) => void) => {
  return (fn: IStoreStateFn<S>) => {
    Context.state = typeof fn === 'function' ? fn(Context.getState()) : fn;
  };
};

// rename? store- хранилище, manager - управляющий

export const makeStore = <S extends TDataState = {}>(initialState: S, options: Partial<IContextOptions>): IStore<S> => {
  const BaseContext = createContext<S>(initialState, options);
  const setState = makeSetState<S>(BaseContext);
  const useSubscribe = makeSubscribe<S>(BaseContext);

  // add loggerFn
  const enrich = <D extends Record<string, any> = {}>(
    enrichFn: (setState: (fn: ((prev: S) => S) | S) => void, { state, reset, on }: TStoreEnrichMethods<S>) => D,
  ): TStoreEnrich<S, D> => {
    const enrichData: D = enrichFn((fn) => setState(fn), {
      state: BaseContext.getState,
      reset: BaseContext.reset,
      on: BaseContext.on,
    });

    const filterMethods: TOnlyPublic<D> = onlyPublic<D>(enrichData);

    return {
      useSubscribe: (listener) => useSubscribe(listener),
      setState,
      reset: BaseContext.reset,
      on: BaseContext.on,
      logs: BaseContext.logs,
      state: BaseContext.getState,
      ...filterMethods,
    };
  };

  return {
    useSubscribe: (listener) => useSubscribe(listener),
    setState,
    reset: BaseContext.reset,
    enrich,
    on: BaseContext.on,
    logs: BaseContext.logs,
    state: BaseContext.getState,
  };
};
