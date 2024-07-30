import React from 'react';
import { useStoredValue } from '@core';

import NeedsStore from './needsStore';

import type { INeeds, TNeedsState, TNeedsArgs } from './needs.types';

const useNeeds = (needs: TNeedsArgs): INeeds => {
  const storedNeeds = useStoredValue(needs);

  const state = NeedsStore.useSubscribe<TNeedsState['state']>((s) => s.state);
  const store = NeedsStore.useSubscribe<TNeedsState['store']>((s) => s.store);
  const update = React.useCallback<INeeds['update']>(NeedsStore.update, []);
  const set = React.useCallback<INeeds['set']>(NeedsStore.set, []);

  React.useEffect(() => {
    storedNeeds.forEach((key) => {
      if (Array.isArray(key)) {
        NeedsStore.request(...key);
      } else NeedsStore.request(key);
    });
  }, [storedNeeds]);

  return {
    state,
    store,
    update,
    set,
    useSubscribe: React.useCallback<INeeds['useSubscribe']>(NeedsStore.useSubscribe, []),
    reset: React.useCallback<INeeds['reset']>(NeedsStore.reset, []),
  };
};

export default useNeeds;
