import { replace } from './string';

describe('utils string: fn:', () => {
  test('replace should be passed', () => {
    expect(replace('Some text with ${placeholder}', { placeholder: 'label' })).toEqual('Some text with label');
    expect(replace('Some text with ${placeholder}')).toEqual('Some text with undefined');
    expect(replace('Some text with ${placeholder} ${placeholder}', { placeholder: 'label' })).toEqual(
      'Some text with label label',
    );
    expect(replace('Some text with ${placeholder} ${placeholder}')).toEqual('Some text with undefined undefined');
    expect(
      replace('Some text with {{placeholder}} {{another}}', { placeholder: 'label' }, 'value', '{{', '}}'),
    ).toEqual('Some text with label value');
  });
});
