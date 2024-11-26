import { diff } from './diff';

describe('utils diff: fn:', () => {
  test('should be return simple diff', () => {
    expect(diff(null, null)).toEqual([]);
    expect(diff(null, true)).toEqual([['null', 'true']]);
    expect(diff(['test'], null)).toEqual([['["test"]', 'null']]);
    expect(diff('test', 'key')).toEqual([['test', 'key']]);
    expect(diff({ a: '1' }, null)).toEqual([[JSON.stringify({ a: '1' }), 'null']]);
  });

  test('should be return diff for obj', () => {
    expect(diff({ a: '1' }, { a: '2' })).toEqual([['a:1', 'a:2']]);
    expect(diff({ a: '1' }, { a: null })).toEqual([['a:1', 'a:null']]);
    expect(diff({ a: '1' }, { a: '1', b: '1' })).toEqual([['b:undefined', 'b:1']]);
    expect(diff({ a: '1' }, { b: '1' })).toEqual([
      ['a:1', 'a:undefined'],
      ['b:undefined', 'b:1'],
    ]);
    expect(diff({ a: { b: '1' } }, { a: { b: '2' } })).toEqual([['a.b:1', 'a.b:2']]);
  });
});
