import { IHttps } from './https.types';
import HttpsStore from './httpsStore';

const useHttps = (): IHttps => {
  return {
    setToken: HttpsStore.setToken,
    request: HttpsStore.request,
    namedRequest: HttpsStore.namedRequest,
    useSubscribe: HttpsStore.useSubscribe,
  };
};

export default useHttps;
