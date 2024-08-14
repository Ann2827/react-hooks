import { IStore, TStoreEnrich } from '@core';
import { IHttpsRequestsConfig } from '@hooks';

/**
 * Interfaces for rewrite
 * ==========================================
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface INeedsStoreConfig extends Record<string, unknown> {}

/**
 * Store types
 * ==========================================
 */

export type TNeedsSettings = {
  // TODO: реализовать
  loader: boolean;
};

export type TNeedsState = {
  // постоянные после инита
  settings: TNeedsSettings;
  requests:
    | { [K in keyof INeedsStoreConfig]: keyof IHttpsRequestsConfig | [keyof IHttpsRequestsConfig, ...string[]] }
    | null;
  rules: <K extends keyof INeedsStoreConfig = keyof INeedsStoreConfig>(
    args: TNeedsInitializeRulesArgs<K>,
  ) => INeedsStoreConfig[K];
  // меняются
  store: INeedsStoreConfig | null;
  state: { [K in keyof INeedsStoreConfig]: boolean | null } | null;
};

export type TNeedsInitializeRulesArgs<K extends keyof INeedsStoreConfig> = {
  request: K;
  // response: THttpsResponseObj<unknown>;
  response: Response;
  dataJsonFormat: unknown;
  args?: unknown;
};

type TNeedsInitialize = {
  settings: Partial<TNeedsState['settings']>;
  store: INeedsStoreConfig;
  requests: { [K in keyof INeedsStoreConfig]: keyof IHttpsRequestsConfig | [keyof IHttpsRequestsConfig, ...string[]] };
  rules: <K extends keyof INeedsStoreConfig = keyof INeedsStoreConfig>(
    args: TNeedsInitializeRulesArgs<K>,
  ) => INeedsStoreConfig[K];
};

export enum NeedsActionTypes {
  refresh = 'refresh',
  merge = 'merge',
}

export interface INeedsData {
  initialize(initial: Partial<TNeedsInitialize>): void;
  /**
   * @deprecated Use action(key, NeedsActionTypes.refresh, ...args)
   */
  update(key: keyof INeedsStoreConfig, ...args: any): Promise<void>;
  request(key: keyof INeedsStoreConfig, ...args: any): Promise<void>;
  set<K extends keyof INeedsStoreConfig = keyof INeedsStoreConfig>(key: K, dataJsonFormat: INeedsStoreConfig[K]): void;
  action(key: keyof INeedsStoreConfig, type: NeedsActionTypes, ...args: any): Promise<void>;
  // TODO: remove
  test(): void;
  st: () => TNeedsState;
}

export type TNeedsStore = TStoreEnrich<TNeedsState, INeedsData>;

export interface INeeds {
  /**
   * Needs store state
   */
  state: TNeedsState['state'];

  /**
   * Needs store
   */
  store: TNeedsState['store'];

  /**
   * Update
   */
  update: INeedsData['update'];

  /**
   * Set exists data
   */
  set: INeedsData['set'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TNeedsState>['useSubscribe'];

  /**
   * Resets the state
   */
  reset: IStore<TNeedsState>['reset'];
}

export type TNeedsArgs = (keyof INeedsStoreConfig | [keyof INeedsStoreConfig, ...any])[];
