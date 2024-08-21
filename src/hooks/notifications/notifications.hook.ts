import React from 'react';

import { INotifications } from './notifications.types';
import NotificationsStore from './notificationsStore';

const useNotifications = (): INotifications => {
  const notifications = NotificationsStore.useSubscribe((state) => state.notifications);

  return {
    notifications,
    send: React.useCallback<INotifications['send']>(NotificationsStore.send, []),
    drop: React.useCallback<INotifications['drop']>(NotificationsStore.drop, []),
    clear: React.useCallback<INotifications['clear']>(NotificationsStore.clear, []),
    useSubscribe: React.useCallback<INotifications['useSubscribe']>(NotificationsStore.useSubscribe, []),
    reset: React.useCallback<INotifications['reset']>(NotificationsStore.reset, []),
  };
};

export default useNotifications;
