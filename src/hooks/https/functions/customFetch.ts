import { TCustomFetch, TCustomFetchCheck, TCustomFetchSettings } from '../https.types';

export const makeCustomFetch = (
  checkRequest: TCustomFetchCheck,
  settings?: Partial<TCustomFetchSettings>,
): TCustomFetch => {
  const makeMock = settings?.makeMock ?? false;
  const mockDelay = settings?.mockDelay ?? 0;
  const realFallback = settings?.realFallback ?? false;

  return (input, init, options): Promise<Response> => {
    if (!makeMock) {
      return fetch(input, init);
    }

    const response: Response | void = checkRequest({
      input,
      init,
      mockName: options?.mockName,
      requestName: options?.requestName,
    });

    if (!response && realFallback) {
      return fetch(input, init);
    }

    if (!response) throw new Error('Mock data does`t exists');

    return new Promise<Response>((resolve) => {
      if (!mockDelay) resolve(response);

      setTimeout(() => {
        resolve(response);
      }, mockDelay * 1000);
    });
  };
};
