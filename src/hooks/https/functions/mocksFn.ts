import { TCustomFetchCheck, THttpsMockConfig } from '../https.types';

export const makeMocksFn = (mocks: THttpsMockConfig): TCustomFetchCheck => {
  return ({ input, init, mockName, requestName }): Response | void => {
    if (mocks?.additionalRules) {
      const response = mocks.additionalRules({ input, init, mockName, requestName });
      if (response) return response;
    }
    // TODO: mockName когда появятся сценарии
    // if (mocks.scenarios) {}
    if (mocks.namedRequests && requestName) {
      const request = mocks.namedRequests?.[requestName];
      if (request) {
        return new Response(JSON.stringify(request.body), request.init);
      }
    }
  };
};
