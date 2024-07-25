import { makeStore } from '@core';

import { TMessagesState, IMessagesData } from './messages.types';

const dataOptions = {
  hookName: 'messages',
  logger: false,
};
export const logsMessagesEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TMessagesState = { counter: 0 };

// https://ru.wikipedia.org/wiki/Список_кодов_состояния_HTTP

const MessagesStore = makeStore<TMessagesState>(initialState, dataOptions).enrich<IMessagesData>((setState) => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const initialize = () => {};
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const parse: IMessagesData['parse'] = (response, dataJson): void => {};

  return {
    initialize,
    parse,
  };
});

export default MessagesStore;
