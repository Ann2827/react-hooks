import React from 'react';
import { onlyPublic, TOnlyPublic } from '@utils';

import { createContext, IContextOptions, TContextFn, IContext } from '../context';
import { makeEffectOn } from '../helper';

import { TDataState, IStore, IStoreStateFn, TStoreEnrich, TStoreEnrichMethods } from './store.types';

// TODO: see reselect lib
export const makeSubscribe = <S extends TDataState = {}>(Context: IContext<S>): IStore<S>['useSubscribe'] => {
  // @ts-ignore
  const useEffectOn = makeEffectOn<Parameters<TContextFn<S>>>(Context.on);
  return <T = unknown>(listener: (state: S) => T): T => {
    // @ts-ignore
    const refListener = React.useRef(listener);
    const [state, setNewState] = React.useState<T>(refListener.current(Context.state));
    useEffectOn((prev, next) => {
      // @ts-ignore
      const nextState = refListener.current(next);
      // @ts-ignore
      if (JSON.stringify(refListener.current(prev)) !== JSON.stringify(nextState)) {
        setNewState(nextState);
      }
    });
    return state;
  };
};

export const makeSetState = <S extends TDataState = {}>(Context: IContext<S>): ((fn: IStoreStateFn<S>) => void) => {
  return (fn: IStoreStateFn<S>) => {
    // @ts-ignore
    Context.state = typeof fn === 'function' ? fn(Context.state) : fn;
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
      useSubscribe,
      setState,
      reset: BaseContext.reset,
      on: BaseContext.on,
      ...filterMethods,
    };
  };

  return {
    useSubscribe,
    setState,
    reset: BaseContext.reset,
    enrich,
    on: BaseContext.on,
  };
};
