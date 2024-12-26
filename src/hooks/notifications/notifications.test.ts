import { act, renderHook } from '@testing-library/react-hooks';

import { useNotifications, NotificationsStore } from '.';

describe('notifications.hook function:', () => {
  beforeAll(() => {
    NotificationsStore.initialize({
      settings: { sticky: false, duplicate: true, duration: 3, messages: false },
    });
  });

  afterEach(() => {
    NotificationsStore.clear();
  });

  afterAll(() => {
    NotificationsStore.reset();
  });

  test('useNotifications: should make send', () => {
    const { result, unmount } = renderHook(() => NotificationsStore.useSubscribe((state) => state.notifications));
    act(() => {
      NotificationsStore.send({ data: { title: 'title', text: 'text' }, sticky: true });
    });

    expect(result.current).toEqual([{ data: { title: 'title', text: 'text' }, id: 1, type: 'error' }]);
    unmount();
  });

  test('useNotifications: should make remove by timer', async () => {
    const { result, unmount, rerender } = renderHook(() =>
      NotificationsStore.useSubscribe((state) => state.notifications),
    );
    act(() => {
      NotificationsStore.send({ data: { title: 'title' }, sticky: false, duration: 3 });
    });
    expect(result.current).toEqual([{ data: { title: 'title' }, id: 2, type: 'error' }]);
    await new Promise((res) => {
      setTimeout(() => {
        rerender();
        res(true);
      }, 4000);
    });
    expect(result.current).toEqual([]);
    unmount();
  });
});

describe('notifications.hook hook:', () => {
  beforeAll(() => {
    NotificationsStore.initialize({
      settings: { sticky: false, duplicate: true, duration: 3, messages: false },
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
