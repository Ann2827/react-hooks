import { IStore, TStoreEnrich } from '@core';

import type { INotificationsSendData, TNotificationsType } from '../notifications';

export type TMessagesState = {
  // counter: number;
  codes: Record<string | number, INotificationsSendData>;
};

export type TMessagesInitialize = {
  codes: TMessagesState['codes'];
};

export interface IMessagesData {
  initialize(initial: Partial<TMessagesInitialize>): void;
  parse<T = unknown>(response: Response, dataJson: T): [INotificationsSendData, TNotificationsType] | undefined;
}

export type TMessagesStore = TStoreEnrich<TMessagesState, IMessagesData>;

export interface IMessages {
  /**
   * Messages counter
   */
  // counter: TMessagesState['counter'];

  /**
   * Parse https response
   */
  parse: IMessagesData['parse'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TMessagesState>['useSubscribe'];

  /**
   * Resets the state
   */
  reset: IStore<TMessagesState>['reset'];
}
