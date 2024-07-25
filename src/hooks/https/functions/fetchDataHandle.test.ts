import mockResponse from '../../../../__mocks__/response';

import { fetchDataHandle } from './fetchDataHandle';

describe('https hook functions:', () => {
  let restoreResponse: () => void;
  beforeAll(() => {
    restoreResponse = mockResponse();
  });
  afterAll(() => {
    restoreResponse();
  });

  test('fetchDataHandle: should prepare request data', async () => {
    const [input, init] = fetchDataHandle('https://test.ru', undefined, {
      body: { k: 1 },
      token: 'hhh',
      query: { q: 5 },
    });
    expect(input.href).toEqual('https://test.ru/?q=5');
    expect(init?.body).toEqual('{"k":1}');
  });
});
