import { makeStore } from '@core';

import { TNeedsState, INeedsData } from './needs.types';

const dataOptions = {
  hookName: 'needs',
  logger: false,
};
export const logsNeedsEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TNeedsState = { counter: 0 };

// TODO: turn off messages for named requests from store in https settings and turn on their in this place
const NeedsStore = makeStore<TNeedsState>(initialState, dataOptions).enrich<INeedsData>((setState, state) => {
  const action: INeedsData['action'] = (): void => {
    setState((prev) => ({ counter: prev.counter + 1 }));
  };

  return {
    initialize,
    update,
    status,
    store,
    errors,
  };
});

export default NeedsStore;
