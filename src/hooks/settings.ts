import { logsLoaderEnable } from './loader/loaderStore';
import { logsImagePreloaderEnable } from './imagePreloader/data';

/**
 * @deprecated use MessagesStore.initialize({ logs: true })
 */
export const logsEnable = (): void => {
  logsLoaderEnable();
  logsImagePreloaderEnable();
};
