import { IContextOptions, makeStore } from '@core';
import { loggerData, loggerMessage } from '@utils';

import { TCacheState, ICacheData, TCachePlace, TCacheAction } from './cache.types';
import { getPlace } from './cache.functions';

const PLACEMENTS: TCachePlace[] = ['localStorage', 'sessionStorage'];

const dataOptions: Partial<IContextOptions> = {
  hookName: 'cache',
  logger: false,
  cleanKeys: false,
};
export const logsCacheEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TCacheState = {
  checks: { localStorage: null, sessionStorage: null },
  settings: { place: 'localStorage', prefix: 'cache', maxAge: null },
  placements: {},
};

const CacheStore = makeStore<TCacheState>(initialState, dataOptions).enrich<ICacheData>(
  (setState, { state, reset, init }) => {
    // Private
    const checkPlace = (place: TCachePlace) => {
      let check = state().checks[place];
      if (check !== null) return check;

      try {
        check =
          place in window && typeof window[place].getItem === 'function' && typeof window[place].setItem === 'function';
      } catch {
        check = false;
      }
      setState((prev) => ({ ...prev, checks: { ...prev.checks, [place]: check } }));
      return check;
    };
    const getItem = (place: TCachePlace, key: string): TCacheAction['get'] => {
      if (!checkPlace(place)) return null;
      return window[place].getItem(key);
    };
    const setItem = (place: TCachePlace, key: string, value: string): TCacheAction['set'] => {
      if (!checkPlace(place)) return;
      window[place].setItem(key, value);
    };
    const removeItem = (place: TCachePlace, key: string): TCacheAction['remove'] => {
      if (!checkPlace(place)) return;
      window[place].removeItem(key);
    };
    const getItemKeys = (place: TCachePlace): TCacheAction['keys'] => {
      if (!checkPlace(place)) return [];
      return Object.keys(window[place]);
    };

    // Public
    const initialize: ICacheData['initialize'] = (initial): ReturnType<ICacheData['initialize']> => {
      const { settings, placements } = initial;
      init((prev) => ({
        checks: { ...initialState.checks },
        settings: { ...prev.settings, ...settings },
        placements: { ...prev.placements, ...placements },
      }));
    };
    // @ts-ignore
    const action: ICacheData['action'] = <T extends keyof TCacheAction>(
      place: TCachePlace,
      type: T,
      key: string,
      value: string,
    ) => {
      switch (type) {
        case 'get':
          return getItem(place, key);
        case 'set':
          return setItem(place, key, value);
        case 'remove':
          return removeItem(place, key);
        case 'keys':
          return getItemKeys(place).filter((i) => i.startsWith(key));
      }
      return;
    };

    const setCache: ICacheData['setCache'] = (data, pl): ReturnType<ICacheData['setCache']> => {
      const { placements, settings } = state();
      const { prefix, maxAge, place: settingsPlace } = settings;

      const logs: { message: string; data?: any }[] = [];

      data.forEach((item) => {
        const { maxAge: customMaxAge, key, value } = item;
        const place = getPlace(settingsPlace, pl, placements, key);
        const expires = customMaxAge ?? maxAge;
        const age = expires ? new Date(Date.now() + 1000 * 60 * expires).getTime() : null;
        const itemData = JSON.stringify({ maxAge: age, value });
        const itemKey = `${prefix}-${key}`;

        logs.push({
          message: itemKey,
          data: place + ' ' + (((itemKey.length + itemData.length) * 2) / 1024).toFixed(2) + ' KB',
        });

        action(pl || place, 'set', itemKey, itemData);
      });
      if (dataOptions.logger) loggerData(dataOptions.hookName!, 'Set cache', logs);
    };

    const getCache: ICacheData['getCache'] = (data, pl): ReturnType<ICacheData['getCache']> => {
      const { prefix } = state().settings;
      const cacheData = { ...data };
      (Object.keys(data) as Array<keyof typeof data>).forEach((key) => {
        const place = getPlace(state().settings.place, pl, state().placements, key.toString());
        const value: any = action(place, 'get', `${prefix}-${key.toString()}`);
        try {
          if (typeof value !== 'string') return;
          const objValue = JSON.parse(value);
          if (typeof objValue !== 'object' || objValue === null || !('value' in objValue)) return;
          if (!('maxAge' in objValue) || objValue.maxAge === null || objValue.maxAge >= Date.now())
            cacheData[key] = objValue.value;
        } catch {
          return;
        }
        return;
      });
      return cacheData;
    };

    const removeCache: ICacheData['removeCache'] = (keys, pl): ReturnType<ICacheData['removeCache']> => {
      const { prefix } = state().settings;
      keys.forEach((key) => {
        const place = getPlace(state().settings.place, pl, state().placements, key);
        action(place, 'remove', `${prefix}-${key}`);
      });
      if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Remove cache', keys);
    };

    const resetCache: ICacheData['resetCache'] = (): ReturnType<ICacheData['resetCache']> => {
      const { prefix } = state().settings;
      PLACEMENTS.forEach((place) => {
        const keys = action(place, 'keys', prefix);
        keys.forEach((key) => {
          action(place, 'remove', key);
        });
      });
    };

    return {
      initialize,
      action,
      setCache,
      getCache,
      removeCache,
      resetCache,
    };
  },
);

export default CacheStore;
