// import { act, renderHook } from '@testing-library/react-hooks';

import mockStorage from '../../../__mocks__/storage';

import { CacheStore } from '.';

describe('cache.hook CacheStore:', () => {
  let restoreStorage: () => void;

  beforeAll(() => {
    restoreStorage = mockStorage();
    CacheStore.initialize({});
  });

  afterAll(() => {
    CacheStore.reset();
    restoreStorage();
  });

  test('should set data in localStorage', () => {
    CacheStore.action('localStorage', 'set', 'cache', 'test');
    const value = global.localStorage.getItem('cache');
    expect(value).toEqual('test');
  });

  test('should get data in localStorage', () => {
    global.localStorage.setItem('cache', 'test');
    const value = CacheStore.action('localStorage', 'get', 'cache');
    expect(value).toEqual('test');
  });

  test('should remove data in localStorage', () => {
    global.localStorage.setItem('cache', 'test');
    CacheStore.action('localStorage', 'remove', 'cache');
    const value = global.localStorage.getItem('cache');
    expect(value).toEqual(null);
  });

  test('should setCache in localStorage', () => {
    CacheStore.setCache([{ key: '1', value: 'test' }]);
    const value = global.localStorage.getItem('cache-1');
    expect(value).toEqual(JSON.stringify({ maxAge: null, value: 'test' }));
  });

  test('should getCache in localStorage', () => {
    global.localStorage.setItem('cache-1', JSON.stringify({ maxAge: null, value: 'test' }));
    const value = CacheStore.getCache({ '1': null });
    expect(value).toEqual({ '1': 'test' });
  });
});

// describe('cache.hook function:', () => {
//   beforeEach(() => {
//     const { result } = renderHook(() => useCache());
//     act(() => result.current.reset());
//   });

//   test('useCache: should make action', () => {
//     const { result, unmount } = renderHook(() => useCache());
//     act(() => result.current.action());
//     expect(result.current.counter).toEqual(1);
//     unmount();
//   });
// });
