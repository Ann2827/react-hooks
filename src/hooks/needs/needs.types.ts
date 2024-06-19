import { IStore, TStoreEnrich } from '@core';

export type TNeedsState = {
  counter: number;
};

/**
 * @private
 * @ignore
 */
export interface INeedsData {
  action(): void;
}

export type TNeedsStore = TStoreEnrich<TNeedsState, INeedsData>;

export interface INeeds {
  /**
   * Needs counter
   */
  counter: TNeedsState['counter'];

  /**
   * Action
   */
  action: INeedsData['action'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TNeedsState>['useSubscribe'];

  /**
   * Resets the state
   */
  reset: IStore<TNeedsState>['reset'];
}
