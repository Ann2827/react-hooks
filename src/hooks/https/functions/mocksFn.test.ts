import mockResponse from '../../../../__mocks__/response';

import { makeMocksFn } from './mocksFn';

describe('https hook functions:', () => {
  let restoreResponse: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
  });
  afterAll(() => {
    restoreResponse();
  });

  test('makeMocksFn: should make mock', async () => {
    const checkRequest = makeMocksFn({
      additionalRules: ({ requestName, mockName }) => {
        if (requestName === 'https://test.ru') return new Response(JSON.stringify({ simple: true }));
      },
    });
    const response: Response | void = checkRequest({ input: 'https://test.ru', requestName: 'https://test.ru' });
    const dataJson = await response?.json();
    expect(dataJson).toEqual({ simple: true });
  });
});
