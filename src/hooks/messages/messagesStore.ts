import { makeStore } from '@core';

import type { TMessagesState, IMessagesData } from './messages.types';

const dataOptions = {
  hookName: 'messages',
  logger: false,
  cleanKeys: false,
};
export const logsMessagesEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TMessagesState = { codes: {} };

// https://ru.wikipedia.org/wiki/Список_кодов_состояния_HTTP
// https://developer.mozilla.org/ru/docs/Web/HTTP/Status

const MessagesStore = makeStore<TMessagesState>(initialState, dataOptions).enrich<IMessagesData>(
  (_setState, { state, init }) => {
    const initialize: IMessagesData['initialize'] = (initial): ReturnType<IMessagesData['initialize']> => {
      const { codes } = initial;
      init((prev) => ({
        ...prev,
        codes: codes ? { ...prev.codes, ...codes } : prev.codes,
      }));
    };

    const parse: IMessagesData['parse'] = (response, _dataJson): ReturnType<IMessagesData['parse']> => {
      const { default: errDefaultObj, ...codes } = state().codes;

      const errCodeArr = Object.entries(codes).find(
        ([key]) =>
          (typeof key === 'number' && key === response.status) ||
          (typeof key === 'string' && key.split(';').some((i) => Number(i) === response.status)),
      );

      if (!errCodeArr && !errDefaultObj) return;
      return [{ ...errDefaultObj, ...errCodeArr?.[1] }, response.ok ? 'success' : 'error'];
    };

    return {
      initialize,
      parse,
    };
  },
);

export default MessagesStore;
