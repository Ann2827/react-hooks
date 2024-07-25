import { makeStore } from '@core';

import { TLoaderState, ILoaderData } from './loader.types';

const dataOptions = {
  hookName: 'loader',
  logger: false,
};
export const logsLoaderEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: TLoaderState = { active: false, quantity: 0 };

const LoaderStore = makeStore<TLoaderState>(initialState, dataOptions).enrich<ILoaderData>((setState, { state }) => {
  const activate: ILoaderData['activate'] = (): void => {
    setState((prev) => ({ active: true, quantity: prev.quantity + 1 }));
  };
  const stop: ILoaderData['stop'] = (): void => {
    setState({ active: false, quantity: 0 });
  };
  const determinate: ILoaderData['determinate'] = (): void => {
    if (state().quantity > 1) {
      setState((prev) => ({ active: true, quantity: prev.quantity - 1 }));
    } else stop();
  };

  return {
    activate,
    determinate,
    stop,
  };
});

export default LoaderStore;
