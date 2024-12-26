import { makeStore } from '@core';

import LoaderStore, { logsLoaderEnable } from '../loader/loaderStore';
import { logsImagePreloaderEnable } from '../imagePreloader/data';
import HttpsStore, { logsHttpsEnable } from '../https/httpsStore';
import MessagesStore, { logsMessagesEnable } from '../messages/messagesStore';
import NeedsStore, { logsNeedsEnable } from '../needs/needsStore';
import NotificationsStore, { logsNotificationsEnable } from '../notifications/notificationsStore';
import CacheStore, { logsCacheEnable } from '../cache/cacheStore';
import TimerStore, { logsTimerEnable } from '../timer/timerStore';

import { TSettingsState, ISettingsData } from './settings.types';

const dataOptions = {
  hookName: 'settings',
  logger: false,
};
export const logsSettingsEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TSettingsState = {};
// TODO: logs only for some hooks
const SettingsStore = makeStore<TSettingsState>(initialState, dataOptions).enrich<ISettingsData>(
  (_setState, { init }) => {
    const initialize: ISettingsData['initialize'] = (initState): void => {
      const { logger, modules } = initState;
      init(() => {
        if (logger) {
          [
            SettingsStore,
            LoaderStore,
            HttpsStore,
            MessagesStore,
            NeedsStore,
            NotificationsStore,
            CacheStore,
            TimerStore,
          ].forEach((item) => {
            item.logs(true);
          });
          logsSettingsEnable();
          logsLoaderEnable();
          logsHttpsEnable();
          logsMessagesEnable();
          logsNeedsEnable();
          logsImagePreloaderEnable();
          logsNotificationsEnable();
          logsCacheEnable();
          logsTimerEnable();
        }

        if (modules?.cache) CacheStore.initialize(modules.cache);
        if (modules?.messages) MessagesStore.initialize(modules.messages);
        if (modules?.notifications) NotificationsStore.initialize(modules.notifications);
        if (modules?.https) HttpsStore.initialize(modules.https);
        if (modules?.needs) NeedsStore.initialize(modules.needs);

        return {};
      });
    };

    return {
      initialize,
      // TODO: add when deprecated
      // on,
    };
  },
);

export default SettingsStore;
