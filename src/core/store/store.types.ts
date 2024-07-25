import { TOnlyPublic } from '@utils';

import { IContext } from '../context';

export type TDataState = Object;

export type IStoreStateFn<S> = ((prev: S) => S) | S;
export interface IStoreBase<S extends TDataState> extends Object {
  useSubscribe<T = unknown>(listener: (state: S) => T): T;
  // TODO: with option merge must type works for partial state
  setState(fn: IStoreStateFn<S>): void;
  reset: IContext<S>['reset'];
  /**
   * @deprecated use useSubscribe
   */
  on: IContext<S>['on'];
}
export type TStoreEnrich<S extends TDataState = {}, D extends Object = {}> = IStoreBase<S> & TOnlyPublic<D>;
export type TStoreEnrichMethods<S extends TDataState = {}> = {
  state: () => S;
  reset: IContext<S>['reset'];
  on: IContext<S>['on'];
};
export interface IStore<S extends TDataState = {}> extends IStoreBase<S> {
  enrich<D extends Record<string, any> = {}>(
    enrichFn: (setState: (fn: ((prev: S) => S) | S) => void, { state, reset, on }: TStoreEnrichMethods<S>) => D,
  ): TStoreEnrich<S, D>;
}
