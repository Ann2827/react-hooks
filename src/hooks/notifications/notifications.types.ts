import { IStore, TStoreEnrich } from '@core';

/**
 * Interfaces for rewrite
 * ==========================================
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface INotificationsSendData extends Partial<Record<'title' | 'text' | 'action', string>> {}

/**
 * ==========================================
 */

export type TNotificationsSettings = {
  // loader: boolean;
  // messages: boolean;
  // waitToken: boolean;
  // mockMode: boolean;
  /**
   * Do not hide the message automatically
   * @default false
   */
  sticky: boolean;

  /**
   * Duration of the message display
   * @default 3000
   */
  duration: number;

  /**
   * Allows you to duplicate a message while the same is already hanging.
   * When is false, you need to set tag for alert. If the tag is not specified, the message will be duplicated.
   * @default true
   */
  duplicate: boolean;

  /**
   * Max visible notifications. Default without limit
   */
  // limit: number | undefined;

  /**
   * With messages store (translations)
   * @default false
   */
  messages: boolean;
};

type TNotificationsStateNotifications = {
  data: INotificationsSendData;
  type: TNotificationsType;
  id: number;
  response?: Response;
};

export type TNotificationsState = {
  // counter: number;
  settings: TNotificationsSettings;
  lastID: number;
  notifications: TNotificationsStateNotifications[];
};

type TNotificationsInitialize = {
  settings: Partial<TNotificationsState['settings']>;
};

export type TNotificationsType = 'error' | 'warning' | 'success' | 'info';

type INotificationsSendProps = {
  data: TNotificationsStateNotifications['data'];
  /**
   * @default error
   */
  type?: TNotificationsStateNotifications['type'];
  sticky?: TNotificationsSettings['sticky'];
  duration?: TNotificationsSettings['duration'];
  response?: TNotificationsStateNotifications['response'];
};

export interface INotificationsData {
  initialize(initial: Partial<TNotificationsInitialize>): void;
  send(props: INotificationsSendProps): number | undefined;
  drop(id: number): void;
  clear(): void;
}

export type TNotificationsStore = TStoreEnrich<TNotificationsState, INotificationsData>;

export interface INotifications {
  /**
   * Notifications list
   */
  notifications: TNotificationsState['notifications'];

  /**
   * Send notification and return id
   */
  send: INotificationsData['send'];

  /**
   * Drop notification by ID
   */
  drop: INotificationsData['drop'];

  /**
   * Clear all notifications
   */
  clear: INotificationsData['clear'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TNotificationsState>['useSubscribe'];

  /**
   * Resets the state
   */
  reset: IStore<TNotificationsState>['reset'];
}
