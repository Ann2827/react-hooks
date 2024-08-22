import { makeStore } from '@core';
import { loggerMessage } from '@utils';

import TimerStore from '../timer/timerStore';

import { TNotificationsState, INotificationsData } from './notifications.types';

const dataOptions = {
  hookName: 'notifications',
  logger: false,
};
export const logsNotificationsEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TNotificationsState = {
  settings: { sticky: false, duration: 3000, duplicate: true, messages: false },
  lastID: 0,
  notifications: [],
};

const NotificationsStore = makeStore<TNotificationsState>(initialState, dataOptions).enrich<INotificationsData>(
  (setState, { state }) => {
    const initialize: INotificationsData['initialize'] = (initial): ReturnType<INotificationsData['initialize']> => {
      const { settings } = initial;
      setState((prev) => ({
        ...prev,
        settings: settings ? { ...prev.settings, ...settings } : prev.settings,
      }));
      if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Was initialized', state());
    };

    const drop: INotificationsData['drop'] = (id): ReturnType<INotificationsData['drop']> => {
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((item) => item.id !== id),
      }));
      TimerStore.cancelTimer(`notification-${id}`);
    };

    const send: INotificationsData['send'] = (props): ReturnType<INotificationsData['send']> => {
      const { type = 'error', data, duration, sticky, response } = props;

      const currentHash = JSON.stringify(data);
      if (
        !state().settings.duplicate &&
        state().notifications.some((item) => JSON.stringify(item.data) === currentHash)
      )
        return;

      const currentID = state().lastID + 1;
      setState((prev) => ({
        ...prev,
        lastID: currentID,
        notifications: [...prev.notifications, { id: currentID, data, type, response }],
      }));

      const time = duration ?? state().settings.duration;
      if (!(sticky ?? state().settings.sticky) && time) {
        TimerStore.setTimer(time, { name: `notification-${currentID}`, callback: () => drop(currentID) });
      }

      return currentID;
    };

    const clear: INotificationsData['clear'] = (): ReturnType<INotificationsData['clear']> => {
      state().notifications.forEach((item) => {
        drop(item.id);
      });
    };

    return {
      send,
      drop,
      clear,
      initialize,
    };
  },
);

export default NotificationsStore;
