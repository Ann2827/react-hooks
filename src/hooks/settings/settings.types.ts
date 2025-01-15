import { TStoreEnrich } from '@core';

import { THttpsInitialize } from '../https/https.types';
import { TNeedsInitialize } from '../needs/needs.types';
import { TCacheInitialize } from '../cache/cache.types';
import { TNotificationsInitialize } from '../notifications/notifications.types';
import { TMessagesInitialize } from '../messages/messages.types';
import { TScenariosInitialize } from '../scenarios/scenarios.types';

export type TSettingsState = {};

type TSettingsModules = {
  https: Partial<THttpsInitialize>;
  needs: Partial<TNeedsInitialize>;
  cache: Partial<TCacheInitialize>;
  notifications: Partial<TNotificationsInitialize>;
  messages: Partial<TMessagesInitialize>;
  scenarios: Partial<TScenariosInitialize>;
};

type TSettingsInitialize = {
  logger: boolean;
  modules: Partial<TSettingsModules>;
};

export interface ISettingsData {
  /**
   * Common settings for admin hooks
   */
  initialize(initState: Partial<TSettingsInitialize>): void;

  /**
   * Listen on settings changed
   */
  // on: TStoreEnrichMethods<TSettingsState>['on'];
}

export type TSettingsStore = TStoreEnrich<TSettingsState, ISettingsData>;
