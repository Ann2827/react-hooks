import { ILoader } from './loader.types';
import LoaderStore from './loaderStore';

/**
 * @deprecated use LoaderStore
 */
const fnLoader = (): Pick<ILoader, 'loaderOn' | 'loaderOff' | 'loaderStop'> => {
  return {
    loaderOn: LoaderStore.activate,
    loaderOff: LoaderStore.determinate,
    loaderStop: LoaderStore.stop,
  };
};

export default fnLoader;
