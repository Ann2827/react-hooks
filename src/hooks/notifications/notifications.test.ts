import { act, renderHook } from '@testing-library/react-hooks';

import { useNotifications, NotificationsStore } from '.';

describe('notifications.hook function:', () => {
  beforeAll(() => {
    NotificationsStore.initialize({
      settings: { sticky: false, duplicate: true, duration: 3000, messages: false },
    });
  });

  afterAll(() => {
    NotificationsStore.reset();
  });

  test('useNotifications: should make send', () => {
    const { result, unmount } = renderHook(() => useNotifications());
    act(() => {
      result.current.send({ data: { title: 'title', text: 'text' }, sticky: true });
    });
    expect(result.current.notifications).toEqual([{ data: { title: 'title', text: 'text' }, id: 1, type: 'error' }]);
    unmount();
  });
});
