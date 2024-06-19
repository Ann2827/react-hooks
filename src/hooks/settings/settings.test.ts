import { SettingsStore } from '.';

describe('SettingsStore:', () => {
  test('on:', () => {
    let prevS = null;
    let newS = null;

    const clean = SettingsStore.on((prevState, newState) => {
      prevS = prevState;
      newS = newState;
    });

    SettingsStore.initialize({ logger: true });
    expect(prevS).toEqual({ logger: false });
    expect(newS).toEqual({ logger: true });
    clean();
  });
});
