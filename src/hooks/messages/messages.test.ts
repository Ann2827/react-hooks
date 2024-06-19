// import { act, renderHook } from '@testing-library/react-hooks';

import { MessagesStore } from '.';

const translationConfig: Record<'ru' | 'en', Record<string, unknown>> = {
  ru: {
    test: 'Мой тестовый текст',
  },
  en: {
    test: 'My test text',
  },
};
const currentLocale: 'ru' | 'en' = 'ru';
const mockTranslationFn = (key: string): string => {
  const translationLang = translationConfig[currentLocale || 'en'];
  const text = translationLang?.[key];
  return typeof text === 'string' ? text : key;
};

describe('MessagesStore:', () => {
  beforeAll(() => {
    MessagesStore.initialize({
      settings: { autoToast: true },
      translationFn: mockTranslationFn,
      standardErrors: {},
    });
  });

  afterAll(() => {
    MessagesStore.reset();
  });

  test('useMessages: should make action', () => {
    MessagesStore.parse(new Response(), {});
  });
});

// describe('messages.hook function:', () => {
//   beforeEach(() => {
//     const { result } = renderHook(() => useMessages());
//     act(() => result.current.reset());
//   });
//
//   test('useMessages: should make action', () => {
//     const { result, unmount } = renderHook(() => useMessages());
//     act(() => result.current.parse());
//     expect(result.current.counter).toEqual(1);
//     unmount();
//   });
// });
