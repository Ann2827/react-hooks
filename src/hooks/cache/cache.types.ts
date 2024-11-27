import { IStore, TStoreEnrich } from '@core';

export type TCachePlace = 'localStorage';
export type TCacheAction = {
  get: string | null;
  set: void;
  remove: void;
  keys: string[];
};
export type TCacheActionType = keyof TCacheAction;

export type TCacheSettings = {
  place: TCachePlace;
  prefix: string;
  // in min
  maxAge: number | null;
};
export type TCacheState = {
  settings: TCacheSettings;
  checks: { [K in TCachePlace]: boolean | null };
};
export type TCacheSetData = {
  maxAge?: TCacheSettings['maxAge'];
  key: string;
  value: any;
};

type TCacheInitialize = {
  settings: Partial<TCacheState['settings']>;
};

export interface ICacheData {
  initialize(initial: Partial<TCacheInitialize>): void;
  action<T extends keyof TCacheAction>(place: TCachePlace, type: T, key: string, value?: string): TCacheAction[T];
  setCache(data: TCacheSetData[]): void;
  getCache<T extends object = Record<string, Record<string, unknown> | null>>(data: T): Partial<T>;
  resetCache(): void;
}

export type TCacheStore = TStoreEnrich<TCacheState, ICacheData>;

export interface ICache {
  /**
   * Action
   */
  action: ICacheData['action'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TCacheState>['useSubscribe'];

  /**
   * Resets the state
   */
  reset: IStore<TCacheState>['reset'];
}
