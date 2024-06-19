import mockResponse from '../../../../__mocks__/response';

import { makeCustomFetch } from './customFetch';

describe('https hook functions:', () => {
  let restoreResponse: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
  });
  afterAll(() => {
    restoreResponse();
  });

  test('customFetch: should make mock', async () => {
    const customFetch = makeCustomFetch(
      ({ input }) => {
        if (input === 'http://test.com') {
          return new Response(JSON.stringify({ data: 'some data' }));
        }
      },
      { realFallback: false, makeMock: true },
    );
    const response = await customFetch('http://test.com');
    const dataJson = await response.json();
    expect(dataJson).toEqual({ data: 'some data' });
  });
});
