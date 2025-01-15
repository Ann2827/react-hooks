import { IStore, TStoreEnrich } from '@core';

import { IHttpsRequestsConfig, THttpsStateStatusLog } from '../https';

export type TScenariosRequestArgs<K extends keyof IHttpsRequestsConfig> = THttpsStateStatusLog<K> & { valid: boolean };

/**
 * Interfaces for rewrite
 * ==========================================
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IScenariosAfterRequests extends Partial<Record<keyof IHttpsRequestsConfig, void>> {}

/**
 * Common types
 * ==========================================
 */

export type TScenariosRequestFn<K extends keyof IHttpsRequestsConfig> = (
  args: TScenariosRequestArgs<K>,
) => IScenariosAfterRequests[K];

export type TScenariosSettings = {};

export type TScenariosState = {
  settings: TScenariosSettings;
  afterRequest: {
    [K in keyof IScenariosAfterRequests]: TScenariosRequestFn<K>;
  };
};

export type TScenariosInitialize = {
  settings: Partial<TScenariosState['settings']>;
  afterRequest: TScenariosState['afterRequest'];
};

export interface IScenariosData {
  initialize(initial: Partial<TScenariosInitialize>): void;
  after<K extends keyof IHttpsRequestsConfig = keyof IHttpsRequestsConfig>(
    key: K,
  ): IScenariosAfterRequests[K] | undefined;
}

export type TScenariosStore = TStoreEnrich<TScenariosState, IScenariosData>;

/**
 * Позволяет запускать связанные сценарии, после выполнения запроса.
 */
export interface IScenarios {
  /**
   * Action after request
   */
  after: IScenariosData['after'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TScenariosState>['useSubscribe'];

  /**
   * Resets the state
   */
  reset: IStore<TScenariosState>['reset'];
}
