import { isObject } from './guards';

describe('utils guards: fn:', () => {
  test('isObject', () => {
    expect(isObject({ k: 1 })).toEqual(true);
    expect(isObject(null)).toEqual(false);
    expect(isObject('test')).toEqual(false);
    expect(isObject(['test'])).toEqual(false);
  });
});
