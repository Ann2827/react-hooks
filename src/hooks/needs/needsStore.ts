import { makeStore } from '@core';
import { isObject, loggerMessage } from '@utils';

import { HttpsStore } from '../https';
import { CacheStore } from '../cache';

import { TNeedsState, INeedsData, INeedsStoreConfig, NeedsActionTypes } from './needs.types';

const dataOptions = {
  hookName: 'needs',
  logger: false,
  // TODO: отключила, т к сломалось
  cleanKeys: false,
};
export const logsNeedsEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TNeedsState = {
  settings: { loader: false, cache: {} },
  store: null,
  requests: null,
  state: null,
  rules: () => {
    return;
  },
  response: null,
};

// TODO: turn off messages for named requests from store in https settings and turn on their in this place
const NeedsStore = makeStore<TNeedsState>(initialState, dataOptions).enrich<INeedsData>((setState, { state }) => {
  // Private
  const updateSuccessData = <T extends keyof INeedsStoreConfig>(key: T, dataJson: INeedsStoreConfig[T]): void => {
    setState((prev) => {
      return { ...prev, state: { ...prev.state, [key]: true }, store: { ...prev.store, [key]: dataJson } };
    });
    if (state().settings.cache[key])
      CacheStore.setCache([{ key: key.toString(), maxAge: state().settings.cache[key], value: dataJson }]);
  };
  const mergeSuccessData = <T extends keyof INeedsStoreConfig>(key: T, dataJson: INeedsStoreConfig[T]): void => {
    setState((prev) => {
      return {
        ...prev,
        state: { ...prev.state, [key]: true },
        store: {
          ...prev.store,
          [key]:
            prev.store?.[key] && typeof prev.store[key] === 'object' && typeof dataJson === 'object'
              ? Object.assign({}, prev.store?.[key], dataJson)
              : prev.store?.[key] && Array.isArray(prev.store[key]) && Array.isArray(dataJson)
                ? prev.store?.[key].concat(dataJson)
                : dataJson,
        },
      };
    });
    if (state().settings.cache[key])
      CacheStore.setCache([{ key: key.toString(), maxAge: state().settings.cache[key], value: state().store?.[key] }]);
  };

  // Public
  const initialize: INeedsData['initialize'] = (initial): ReturnType<INeedsData['initialize']> => {
    const { settings, store, requests, rules } = initial;
    setState((prev) => {
      const updateState: TNeedsState = { ...prev };
      if (store) {
        updateState.store = { ...store };
        updateState.state = (Object.keys(store) as Array<keyof typeof store>).reduce((p, key) => {
          // @ts-ignore
          return p !== null && typeof p === 'object' ? { ...p, [key]: null } : { [key]: null };
        }, null);
        updateState.response = (Object.keys(store) as Array<keyof typeof store>).reduce((p, key) => {
          // @ts-ignore
          return p !== null && typeof p === 'object' ? { ...p, [key]: null } : { [key]: null };
        }, null);
      }
      if (requests) updateState.requests = { ...requests };
      if (settings) updateState.settings = { ...prev.settings, ...settings };
      if (rules) updateState.rules = rules;
      return updateState;
    });
    if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Was initialized', state());
  };
  const action: INeedsData['action'] = async (key, type, ...args): ReturnType<INeedsData['action']> => {
    const requestData = state().requests?.[key];
    const [requestName, ...path] = Array.isArray(requestData) ? requestData : [requestData];

    if (!requestName) {
      loggerMessage(dataOptions.hookName!, 'namedRequest not found');
      return;
    }
    const { response, dataJson } = await HttpsStore.namedRequest(requestName, ...args);
    if (response?.ok) {
      // @ts-ignore
      const dataJsonFormat = path.reduce(
        (prev: unknown, item: string) => (isObject(prev) && item in prev ? prev[item] : prev),
        dataJson,
      );
      const dataJsonWithRules = state().rules({ request: key, response, dataJsonFormat, args });

      if (type === NeedsActionTypes.merge) {
        mergeSuccessData(key, dataJsonWithRules || dataJsonFormat);
        return;
      }

      updateSuccessData(key, dataJsonWithRules || dataJsonFormat);
    } else {
      setState((prev) => ({
        ...prev,
        state: prev.state ? { ...prev.state, [key]: false } : null,
        response: prev.response ? { ...prev.response, [key]: response || null } : null,
      }));
    }
  };
  const request: INeedsData['request'] = async (key, ...args): ReturnType<INeedsData['request']> => {
    if (state().state?.[key] !== null) return;
    if (state().settings.cache[key]) {
      const cache = CacheStore.getCache({
        [key]: null,
      });
      if (cache[key]) {
        if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Restored from cache', cache[key]);
        updateSuccessData(key, cache[key]);
        return;
      }
    }
    await action(key, NeedsActionTypes.refresh, ...args);
  };
  const update: INeedsData['update'] = async (key, ...args): ReturnType<INeedsData['update']> => {
    await action(key, NeedsActionTypes.refresh, ...args);
  };
  const set: INeedsData['set'] = (key, dataJsonFormat): ReturnType<INeedsData['set']> => {
    updateSuccessData(key, dataJsonFormat);
  };

  return {
    initialize,
    update,
    request,
    set,
    st: () => state(),
    action,
    // status,
    // store,
    // errors,
  };
});

export default NeedsStore;
