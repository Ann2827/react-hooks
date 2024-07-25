import React from 'react';

import { INeeds } from './needs.types';
import NeedsStore from './needsStore';

const useNeeds = (): INeeds => {
  const counter = NeedsStore.useSubscribe<number>((state) => state.counter);

  return {
    counter,
    action: React.useCallback<INeeds['action']>(NeedsStore.action, []),
    useSubscribe: React.useCallback<INeeds['useSubscribe']>(NeedsStore.useSubscribe, []),
    reset: React.useCallback<INeeds['reset']>(NeedsStore.reset, []),
  };
};

export default useNeeds;
