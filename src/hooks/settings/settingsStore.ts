import { makeStore } from '@core';
import { loggerMessage } from '@utils';

import { logsLoaderEnable } from '../loader/loaderStore';
import { logsImagePreloaderEnable } from '../imagePreloader/data';
import { logsHttpsEnable } from '../https/httpsStore';
import { logsMessagesEnable } from '../messages/messagesStore';
import { logsNeedsEnable } from '../needs/needsStore';

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
const SettingsStore = makeStore<TSettingsState>(initialState, dataOptions).enrich<ISettingsData>((setState) => {
  const initialize: ISettingsData['initialize'] = (initState): void => {
    const { logger } = initState;
    setState(initState);

    if (logger) {
      logsSettingsEnable();
      logsLoaderEnable();
      logsImagePreloaderEnable();
      logsHttpsEnable();
      logsMessagesEnable();
      logsNeedsEnable();
    }
    if (dataOptions.logger) loggerMessage(dataOptions.hookName, 'Was initialized');
  };

  return {
    initialize,
    // TODO: add when deprecated
    // on,
  };
});

export default SettingsStore;
