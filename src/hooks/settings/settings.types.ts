import { TStoreEnrich } from '@core';

export type TSettingsState = {
  logger: boolean;
};

export interface ISettingsData {
  /**
   * Common settings for admin hooks
   */
  initialize(initState: TSettingsState): void;

  /**
   * Listen on settings changed
   */
  // on: TStoreEnrichMethods<TSettingsState>['on'];
}

export type TSettingsStore = TStoreEnrich<TSettingsState, ISettingsData>;
