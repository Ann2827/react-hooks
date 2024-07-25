import { IStore, TStoreEnrich } from '@core';

export type TMessagesState = {
  counter: number;
};

export type TMessagesInitialize = {};

export interface IMessagesData {
  initialize(initial: Partial<TMessagesInitialize>): void;
  parse<T = unknown>(response: Response, dataJson: T): void;
}

export type TMessagesStore = TStoreEnrich<TMessagesState, IMessagesData>;

export interface IMessages {
  /**
   * Messages counter
   */
  counter: TMessagesState['counter'];

  /**
   * Parse https response
   */
  parse: IMessagesData['parse'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<TMessagesState>['useSubscribe'];
}
