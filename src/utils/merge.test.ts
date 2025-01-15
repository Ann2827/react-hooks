import { mergeObjects } from './merge';

describe('Utils mergeObjects fn:', () => {
  test('shouldn`t replace value with undefined', () => {
    expect(
      mergeObjects(
        {
          k: '123',
        },
        {
          k: undefined,
        },
      ),
    ).toEqual({
      k: '123',
    });
    expect(
      mergeObjects(
        {
          k: null,
        },
        {
          k: undefined,
        },
      ),
    ).toEqual({
      k: null,
    });
    expect(
      mergeObjects(
        {
          k: 0,
        },
        {
          k: undefined,
        },
      ),
    ).toEqual({
      k: 0,
    });
    expect(
      mergeObjects(
        {
          k: 0,
          k2: 1,
        },
        {
          k2: undefined,
        },
      ),
    ).toEqual({
      k: 0,
      k2: 1,
    });
    expect(
      mergeObjects<{ k: string[] | null }>(
        {
          k: ['123'],
        },
        {
          k: null,
        },
      ),
    ).toEqual({
      k: null,
    });
  });
});
