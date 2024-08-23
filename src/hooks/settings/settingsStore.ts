import { makeStore } from '@core';
import { loggerMessage } from '@utils';

import LoaderStore, { logsLoaderEnable } from '../loader/loaderStore';
import { logsImagePreloaderEnable } from '../imagePreloader/data';
import HttpsStore, { logsHttpsEnable } from '../https/httpsStore';
import MessagesStore, { logsMessagesEnable } from '../messages/messagesStore';
import NeedsStore, { logsNeedsEnable } from '../needs/needsStore';
import NotificationsStore, { logsNotificationsEnable } from '../notifications/notificationsStore';

import { TSettingsState, ISettingsData } from './settings.types';

const dataOptions = {
  hookName: 'settings',
  logger: false,
};
export const logsSettingsEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TSettingsState = { logger: false };
// TODO: logs only for some hooks
const SettingsStore = makeStore<TSettingsState>(initialState, dataOptions).enrich<ISettingsData>(
  (setState, { state }) => {
    const initialize: ISettingsData['initialize'] = (initState): void => {
      const { logger } = initState;
      setState(initState);

      if (logger) {
        [SettingsStore, LoaderStore, HttpsStore, MessagesStore, NeedsStore, NotificationsStore].forEach((item) => {
          item.logs(true);
        });
        logsSettingsEnable();
        logsLoaderEnable();
        logsHttpsEnable();
        logsMessagesEnable();
        logsNeedsEnable();
        logsImagePreloaderEnable();
        logsNotificationsEnable();
      }
      if (dataOptions.logger) loggerMessage(dataOptions.hookName, 'Was initialized', state());
    };

    return {
      initialize,
      // TODO: add when deprecated
      // on,
    };
  },
);

export default SettingsStore;