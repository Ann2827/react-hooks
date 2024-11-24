import { IStore, TStoreEnrich } from '@core';

export type TLoaderState = {
  active: boolean;
  quantity: number;
};

export type TLoaderEvent = {
  type: 'updated';
};
/**
 * @private
 * @ignore
 */
export interface ILoaderData {
  activate(): void;
  determinate(): void;
  stop(): void;
  // TODO: remove
  st: () => TLoaderState;
}

export type TLoaderStore = TStoreEnrich<TLoaderState, ILoaderData>;

export interface ILoader {
  /**
   * Loader activity status
   */
  active: TLoaderState['active'];

  /**
   * Activate one (or one more) loader.
   */
  loaderOn: ILoaderData['activate'];

  /**
   * Cancel one loader process.
   */
  loaderOff: ILoaderData['determinate'];

  /**
   * Stop all loader processes.
   */
  loaderStop: ILoaderData['stop'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TLoaderState>['useSubscribe'];

  /**
   * This function listens for the events of activate/determinate.
   * @deprecated use useSubscribe hook
   */
  // on(fn: (e: boolean) => void): () => void;

  /**
   * Resets the state
   * @deprecated use reset method
   */
  _reset: IStore<TLoaderState>['reset'];
  reset: IStore<TLoaderState>['reset'];
}

/**
 * @deprecated use ILoader interface
 */
export type LoaderI = ILoader;
