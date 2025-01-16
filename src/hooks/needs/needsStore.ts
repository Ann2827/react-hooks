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
  settings: { loader: false, waitRequest: false },
  store: null,
  requests: null,
  cache: null,
  state: null,
  rules: () => {
    return;
  },
  response: null,
};

let httpsListener: () => void = () => {};

// TODO: turn off messages for named requests from store in https settings and turn on their in this place
const NeedsStore = makeStore<TNeedsState>(initialState, dataOptions).enrich<INeedsData>((setState, { state, init }) => {
  // Private
  const updateSuccessData = <T extends keyof INeedsStoreConfig>(
    key: T,
    dataJson: INeedsStoreConfig[T],
    cache = true,
  ): void => {
    setState((prev) => {
      return { ...prev, state: { ...prev.state, [key]: true }, store: { ...prev.store, [key]: dataJson } };
    });
    if (state().cache?.[key] && cache)
      CacheStore.setCache([{ key: key.toString(), maxAge: state().cache?.[key]?.time, value: dataJson }]);
  };
  const mergeSuccessData = <T extends keyof INeedsStoreConfig>(
    key: T,
    dataJson: INeedsStoreConfig[T],
    cache = true,
  ): void => {
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
    if (state().cache?.[key] && cache)
      CacheStore.setCache([{ key: key.toString(), maxAge: state().cache?.[key]?.time, value: state().store?.[key] }]);
  };

  // Public
  const initialize: INeedsData['initialize'] = (initial): ReturnType<INeedsData['initialize']> => {
    const { settings, store, requests, rules, cache } = initial;
    init((prev) => {
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
      if (cache) {
        updateState.cache = { ...cache };
      }
      if (settings) updateState.settings = { ...prev.settings, ...settings };
      if (rules) updateState.rules = rules;
      if (requests) {
        updateState.requests = { ...requests };

        httpsListener?.();
        httpsListener = HttpsStore.on((_prevState, nextState, diffState) => {
          // diffState: status.request.getUsersStat.value:pending -> status.request.getUsersStat.value:stop
          diffState.forEach(([p, n]) => {
            // TODO: Покрыть тестами и может вынести в переменную
            if (!p.includes('value:pending') || !n.includes('value:stop')) return;

            const cacheConfig = state()?.cache;
            const requestName = p.split('.')[2];
            const requestResult = nextState.status.logs[requestName];
            if (!cacheConfig || !requestResult?.response) return;

            Object.entries(cacheConfig).forEach(([needsKey, cacheValue]) => {
              const cacheValueResponse = cacheValue?.clean?.otherResponse;
              if (
                cacheValueResponse?.which === 'token' &&
                cacheValueResponse.token !== nextState.status.request[requestName]?.tokenName
              )
                return;
              if (
                cacheValueResponse?.is === requestResult.response?.ok ||
                (requestResult.response?.status &&
                  Array.isArray(cacheValueResponse?.is) &&
                  cacheValueResponse?.is.includes(requestResult.response.status))
              ) {
                CacheStore.removeCache([needsKey]);
              }
            });
          });
        });
      }

      return updateState;
    });
  };
  const action: INeedsData['action'] = async (key, type, ...args): ReturnType<INeedsData['action']> => {
    const requestData = state().requests?.[key];
    const [requestName, ...path] = Array.isArray(requestData) ? requestData : [requestData];

    if (!requestName) {
      loggerMessage(dataOptions.hookName!, `namedRequest ${key} not found`);
      setState((prev) => ({
        ...prev,
        state: prev.state ? { ...prev.state, [key]: false } : null,
      }));
      return;
    }
    const { response, dataJson } = await HttpsStore.namedRequest(requestName, ...args);
    if (state().settings.waitRequest && !response) return;
    if (response?.ok) {
      // @ts-ignore
      const dataJsonFormat = path.reduce(
        (prev: unknown, item: string) => (isObject(prev) && item in prev ? prev[item] : prev),
        dataJson,
      );
      const dataJsonWithRules = state().rules({ request: key, response, dataJsonFormat, args });

      let needCache = true;
      const thisResponseIs = state().cache?.[key]?.clean?.thisResponseIs;
      if (thisResponseIs === true || (Array.isArray(thisResponseIs) && thisResponseIs.includes(response.status))) {
        CacheStore.removeCache([key.toString()]);
        needCache = false;
      }

      if (type === NeedsActionTypes.merge) {
        mergeSuccessData(key, dataJsonWithRules || dataJsonFormat, needCache);
        return;
      }

      updateSuccessData(key, dataJsonWithRules || dataJsonFormat, needCache);
    } else {
      setState((prev) => ({
        ...prev,
        state: prev.state ? { ...prev.state, [key]: false } : null,
        response: prev.response ? { ...prev.response, [key]: response || null } : null,
      }));
      const thisResponseIs = state().cache?.[key]?.clean?.thisResponseIs;
      if (
        thisResponseIs === false ||
        (response && Array.isArray(thisResponseIs) && thisResponseIs.includes(response.status))
      ) {
        CacheStore.removeCache([key.toString()]);
      }
    }
  };
  const request: INeedsData['request'] = async (key, ...args): ReturnType<INeedsData['request']> => {
    const type = args.includes(NeedsActionTypes.merge)
      ? NeedsActionTypes.merge
      : args.includes(NeedsActionTypes.refresh)
        ? NeedsActionTypes.refresh
        : NeedsActionTypes.request;
    if (state().state?.[key] !== null && type === NeedsActionTypes.request) return;
    if (state().cache?.[key] && type === NeedsActionTypes.request) {
      const cache = CacheStore.getCache({
        [key]: null,
      });
      if (cache[key]) {
        if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Restored from cache', cache[key]);
        updateSuccessData(key, cache[key], false);
        return;
      }
    }
    await action(key, type, ...args);
  };
  const set: INeedsData['set'] = (key, dataJsonFormat): ReturnType<INeedsData['set']> => {
    // @ts-ignore
    const updateData = typeof dataJsonFormat === 'function' ? dataJsonFormat(state().store?.[key]) : dataJsonFormat;
    updateSuccessData(key, updateData);
  };

  return {
    initialize,
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
