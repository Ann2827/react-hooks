import { IContextOptions, makeStore } from '@core';
import { loggerMessage } from '@utils';

import { TCacheState, ICacheData, TCachePlace } from './cache.types';

const dataOptions: Partial<IContextOptions> = {
  hookName: 'cache',
  logger: false,
  cleanKeys: false,
};
export const logsCacheEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TCacheState = {
  checks: { localStorage: null },
  settings: { place: 'localStorage', prefix: 'cache', maxAge: null },
};

const CacheStore = makeStore<TCacheState>(initialState, dataOptions).enrich<ICacheData>((setState, { state }) => {
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
  const getItem = (place: 'localStorage', key: string): string | null | undefined => {
    if (!checkPlace(place)) return;
    return window[place].getItem(key);
  };
  const setItem = (place: 'localStorage', key: string, value: string): void => {
    if (!checkPlace(place)) return;
    window[place].setItem(key, value);
  };
  const removeItem = (place: 'localStorage', key: string): void => {
    if (!checkPlace(place)) return;
    window[place].removeItem(key);
  };

  // Public
  const initialize: ICacheData['initialize'] = (initial): ReturnType<ICacheData['initialize']> => {
    const { settings } = initial;
    setState((prev) => {
      const update: TCacheState = { ...prev };
      if (settings) {
        update.settings = { ...prev.settings, ...settings };
      }
      return update;
    });
    if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Was initialized', state());
  };
  const action: ICacheData['action'] = (
    place: 'localStorage',
    type: 'get' | 'set' | 'remove',
    key: string,
    value: string,
  ): ReturnType<ICacheData['action']> => {
    if (!checkPlace(place)) return;

    switch (type) {
      case 'get':
        return getItem(place, key);
      case 'set':
        return setItem(place, key, value);
      case 'remove':
        return removeItem(place, key);
    }
  };

  const setCache: ICacheData['setCache'] = (data): ReturnType<ICacheData['setCache']> => {
    const { place, prefix, maxAge } = state().settings;
    data.forEach((item) => {
      const { maxAge: customMaxAge, key, value } = item;
      const expires = customMaxAge ?? maxAge;
      const age = expires ? new Date(Date.now() + 1000 * 60 * expires).getTime() : null;
      action(place, 'set', `${prefix}-${key}`, JSON.stringify({ maxAge: age, value }));
    });
  };

  const getCache: ICacheData['getCache'] = (data): ReturnType<ICacheData['getCache']> => {
    const { place, prefix } = state().settings;
    const cacheData = { ...data };
    (Object.keys(data) as Array<keyof typeof data>).forEach((key) => {
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

  return {
    initialize,
    action,
    setCache,
    getCache,
  };
});

export default CacheStore;
