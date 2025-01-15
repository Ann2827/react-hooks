import { IContextOptions, makeStore } from '@core';

import { HttpsStore } from '../https';

import { TScenariosState, IScenariosData } from './scenarios.types';

const dataOptions: Partial<IContextOptions> = {
  hookName: 'scenarios',
  logger: false,
  cleanKeys: false,
};
export const logsScenariosEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TScenariosState = { afterRequest: {}, settings: {} };

const ScenariosStore = makeStore<TScenariosState>(initialState, dataOptions).enrich<IScenariosData>(
  (_setState, { state, init }) => {
    // Public
    const initialize: IScenariosData['initialize'] = (initial): ReturnType<IScenariosData['initialize']> => {
      const { settings, afterRequest } = initial;
      init((prev) => {
        const updateState: TScenariosState = { ...prev };
        if (settings) updateState.settings = { ...prev.settings, ...settings };
        if (afterRequest) updateState.afterRequest = { ...prev.afterRequest, ...afterRequest };
        return updateState;
      });
    };

    const after: IScenariosData['after'] = (key): ReturnType<IScenariosData['after']> => {
      const afterFn = state().afterRequest[key];
      if (!afterFn) return;
      const requestLog = HttpsStore.state().status.logs[key];
      if (!requestLog) return;

      const { dataJson, response } = requestLog;
      const validationFn = HttpsStore.state().validation?.[key];
      return afterFn({ ...requestLog, valid: validationFn?.(dataJson, response) ?? true });
    };

    return {
      initialize,
      after,
    };
  },
);

export default ScenariosStore;
