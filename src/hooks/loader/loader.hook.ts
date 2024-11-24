import React from 'react';

import { ILoader, TLoaderState } from './loader.types';
import LoaderStore from './loaderStore';

const useLoader = (): ILoader => {
  // const active = LoaderStore.useSubscribe<boolean>((state) => state.active);
  const [active, setActive] = React.useState<TLoaderState['active']>(LoaderStore.st().active);
  React.useEffect(() => {
    const clean = LoaderStore.on((_prev, next) => {
      setActive(next.active);
    });
    return () => clean();
  }, []);
  // const on = React.useCallback<ILoader['on']>(
  //   (fn) => {
  //     return LoaderStore.on((_prevState, newState) => {
  //       fn(newState.active);
  //     });
  //   },
  //   [active],
  // );

  return {
    active,
    loaderOn: React.useCallback(LoaderStore.activate, []),
    loaderOff: React.useCallback(LoaderStore.determinate, []),
    // on,
    loaderStop: React.useCallback(LoaderStore.stop, []),
    useSubscribe: React.useCallback(LoaderStore.useSubscribe, []),
    _reset: React.useCallback(LoaderStore.reset, []),
    reset: React.useCallback(LoaderStore.reset, []),
  };
};

export default useLoader;
