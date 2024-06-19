import { makeStore } from '@core';

import { TDataTimer, TTimerOptions } from './timer.types';

export type TTimerState = {
  timers: Record<string, TDataTimer | undefined>;
  time: Record<string, number>;
};
type TTimerData = {
  setTimer(time: number, options: TTimerOptions): void;
  cancelTimer(name: string): void;
  clear(): void;
  getTime(name: string): number;
  reset(): void;
};

const initialState: TTimerState = { timers: {}, time: {} };

const TimerStore = makeStore<TTimerState>(initialState, {
  hookName: 'timer',
}).enrich<TTimerData>((setState, { state, reset }) => {
  const getTimer = (name: TTimerOptions['name']): TDataTimer | undefined => state().timers[name];
  const setStateTime = (name: TTimerOptions['name'], time = 0): void => {
    // TODO: когда починится merge setState((prev) => ({ time: { ...prev.time, [name]: time } }));
    setState((prev) => ({ ...prev, time: { ...prev.time, [name]: time } }));
  };
  const setStateTimers = (name: TTimerOptions['name'], data?: TDataTimer): void => {
    setState((prev) => ({ ...prev, timers: { ...prev.timers, [name]: data } }));
  };
  const setStateTimersTime = (name: TTimerOptions['name'], time = 0): void => {
    const timer = getTimer(name);
    if (timer) {
      setState((prev) => ({ ...prev, timers: { ...prev.timers, [name]: { ...timer, time } } }));
    }
  };

  const onDone = (name: TTimerOptions['name']): void => {
    const timer = getTimer(name);
    if (!timer) return;

    // if (timer.options.listen)
    //   this._event({ name, action: 'done', params: timer.options.params, callback: timer.options.callback });
    // Timeout при onDone выполнился сам
    if (timer.type === 'interval') {
      clearInterval(timer.clear);
    }
    if (typeof timer.options.callback === 'function' && timer.options.autoFinish) timer.options.callback();
    setStateTimers(name);
    setStateTime(name);
  };

  const clearTimer = (name: TTimerOptions['name']): void => {
    const timer = getTimer(name);
    if (!timer) return;

    // if (timer.options.listen)
    //   this._event({ name, action: 'cancel', params: timer.options.params, callback: timer.options.callback });
    if (timer.type === 'timeout') {
      clearTimeout(timer.clear);
    }
    if (timer.type === 'interval') {
      clearInterval(timer.clear);
    }
    setStateTimers(name);
    setStateTime(name);
  };

  const startTimeout = (time: number, options: TTimerOptions): void => {
    // if (options.listen)
    //   this._event({ name: options.name, action: 'start', params: options.params, callback: options.callback });
    setStateTimers(options.name, {
      type: 'timeout',
      time,
      options,
      clear: setTimeout(() => onDone(options.name), time * 1000),
    });
  };

  const startInterval = (time: number, options: TTimerOptions): void => {
    // if (options.listen)
    //   this._event({ name: options.name, action: 'start', params: options.params, callback: options.callback });
    setStateTimers(options.name, {
      type: 'interval',
      time,
      options,
      clear: setInterval(() => {
        const timer = getTimer(options.name);
        if (!timer) return;

        const leftTime = Number(timer.time);
        if (leftTime > 0) {
          // if (options.listen)
          //   this._event({
          //     name: options.name,
          //     action: 'change',
          //     params: options.params,
          //     callback: options.callback,
          //     time: leftTime - 1,
          //   });
          setStateTimersTime(options.name, leftTime - 1);
          setStateTime(options.name, leftTime - 1);
        } else {
          onDone(options.name);
        }
      }, 1000),
    });
  };

  // public

  const setTimer = (time: number, options: TTimerOptions): void => {
    if (time <= 0) {
      setStateTime(options.name);
      return;
    }
    clearTimer(options.name);

    setStateTime(options.name, time);
    if (options.observe) {
      startInterval(time, options);
      return;
    }
    startTimeout(time, options);
  };

  const cancelTimer = (name: string): void => {
    clearTimer(name);
  };

  const clear = (): void => {
    Object.keys(state().timers).forEach((name) => {
      cancelTimer(name);
    });
  };

  return {
    setTimer,
    cancelTimer,
    clear,
    getTime(name: string): number {
      return state().time[name] || 0;
    },
    reset() {
      clear();
      reset();
    },
  };
});

export default TimerStore;
