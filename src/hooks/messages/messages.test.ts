// import { act, renderHook } from '@testing-library/react-hooks';

import mockResponse from '../../../__mocks__/response';

import { MessagesStore } from '.';

// const translationConfig: Record<'ru' | 'en', Record<string, unknown>> = {
//   ru: {
//     test: 'Мой тестовый текст',
//   },
//   en: {
//     test: 'My test text',
//   },
// };
// const currentLocale: 'ru' | 'en' = 'ru';
// const mockTranslationFn = (key: string, ...args: unknown[]): string => {
//   const translationLang = translationConfig[currentLocale || 'en'];
//   const text = translationLang?.[key];
//   return typeof text === 'string' ? text : key;
// };

describe('MessagesStore:', () => {
  let restoreResponse: () => void;

  beforeAll(() => {
    restoreResponse = mockResponse();
    MessagesStore.initialize({
      // TODO: Object.enteres сортирует в своем порядке
      codes: {
        '400;401;402;403;404;405;406;407;408;409;410;411;412;413;414;415;416;417;500;501;502;503;504;505': {
          text: 'Попробуйте повторить попытку',
        },
        408: {
          text: 'Соединение с сервером прервано.',
        },
        '503;504': {
          text: 'Внутренняя ошибка сервера.',
        },
        default: {
          title: 'Ошибка {{errorCode}}',
        },
      },
      // settings: { autoToast: true, duration: 3000 },
      // translationFn: mockTranslationFn,
    });
  });

  afterAll(() => {
    MessagesStore.reset();
    restoreResponse();
  });

  test('useMessages: should make parse', () => {
    const data = MessagesStore.parse(new Response(JSON.stringify({ userId: 4 }), { status: 400 }), { userId: 4 });
    expect(data).toEqual([{ text: 'Попробуйте повторить попытку', title: 'Ошибка {{errorCode}}' }, 'error']);
  });
});

// describe('messages.hook function:', () => {
//   beforeEach(() => {
//     const { result } = renderHook(() => useMessages());
//     act(() => result.current.reset());
//   });

//   test('useMessages: should make action', () => {
//     const { result, unmount } = renderHook(() => useMessages());
//     act(() => result.current.parse());
//     expect(result.current.counter).toEqual(1);
//     unmount();
//   });
// });
