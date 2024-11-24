import { IStore, TStoreEnrich } from '@core';

export type TCachePlace = 'localStorage';
export type TCacheActionType = 'get' | 'set' | 'remove';

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
  action(place: TCachePlace, type: TCacheActionType, key: string, value?: string): undefined | string | null | void;
  setCache(data: TCacheSetData[]): void;
  getCache<T extends object = Record<string, Record<string, unknown> | null>>(data: T): Partial<T>;
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
