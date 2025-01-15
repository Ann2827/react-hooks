import { loggerState, loggerMessage, cleanObjKeys, diff, stringifyFunction } from '@utils';

import type { IContext, IContextOptions, TContextFn } from './context.types';

// https://react.dev/reference/react/useSyncExternalStore

export class CreateContext<S extends Object> implements IContext<S> {
  #initialState: S;

  #listeners: Array<TContextFn<S>>;

  #state: S;

  #options: IContextOptions;

  #event(prevState: S, newState: S, diffState: Array<[string, string]>): void {
    this.#listeners.forEach((listener) => listener(prevState, newState, diffState));
  }

  constructor(initialState: S, options?: Partial<IContextOptions>) {
    this.#initialState = initialState;
    this.#listeners = [];
    this.#state = Object.assign({}, initialState);
    this.#options = {
      logger: Boolean(options?.logger),
      hookName: options?.hookName || 'state',
      cleanKeys: options?.cleanKeys ?? true,
      merge: Boolean(options?.merge),
    };

    this.on = this.on.bind(this);
    this.reset = this.reset.bind(this);
    this.getState = this.getState.bind(this);
    this.logs = this.logs.bind(this);
    this.init = this.init.bind(this);
    this.restart = this.restart.bind(this);
    if (typeof this._test === 'function') {
      this._test = this._test.bind(this);
    }
  }

  public on(fn: TContextFn<S>): () => void {
    this.#listeners.push(fn);
    return () => (this.#listeners = this.#listeners.filter((listener) => listener !== fn));
  }

  getState(): S {
    return this.#state;
  }

  get state(): S {
    return (() => this.#state)();
  }

  set state(newState) {
    const { logger, hookName, cleanKeys, merge } = this.#options;
    const cloneThisState: S = Object.assign({}, this.#state);
    const cloneNewState: S = Object.assign({}, newState);
    // TODO: починить
    const cleanNewState: S = cleanKeys ? cleanObjKeys<S, S>(this.#initialState, cloneNewState) : cloneNewState;
    // TODO: depMerge
    const mergeNewState: S = merge
      ? Object.assign({}, cloneThisState, cleanNewState)
      : Object.assign({}, cleanNewState);
    const diffState = diff(cloneThisState, mergeNewState);

    // TODO: может можно доверять условию на diffState?
    // Ни JSON.stringify ни diffState не реагируют на изменения в функциях
    if (JSON.stringify(cloneThisState, stringifyFunction) !== JSON.stringify(mergeNewState, stringifyFunction)) {
      this.#state = mergeNewState;
      this.#event(cloneThisState, mergeNewState, diffState);

      if (logger) loggerState(hookName, cloneThisState, mergeNewState, diffState, this.#listeners.length);
    }
  }

  logs(enable: boolean) {
    this.#options.logger = enable;
  }

  reset(): void {
    this.#listeners = [];
    this.#state = Object.assign({}, this.#initialState);

    const { logger, hookName } = this.#options;
    if (logger) loggerMessage(hookName, 'Was reset');
  }

  get listeners() {
    return [...this.#listeners];
  }

  restart(): void {}

  init(fn: (prev: S) => S) {
    if (this.#options.logger) loggerMessage(this.#options.hookName, 'Was initialized');
    this.state = fn(this.#initialState);
    this.restart = () => {
      if (this.#options.logger) loggerMessage(this.#options.hookName, 'Was restarted');
      fn(this.#initialState);
    };
  }

  _test<T>(method: string): T | undefined {
    // const methods: typeof this = Object.assign(this, { listeners: this.#listeners });
    const methods: typeof this = Object.assign(this);
    // @ts-ignore
    return method in methods ? (methods[method] as T) : undefined;
  }
}

const createContext = <S extends Object>(initialState: S, options?: Partial<IContextOptions>): IContext<S> => {
  const Context = new CreateContext<S>(initialState, options);
  // @ts-ignore
  Context.__proto__._test = undefined;
  // @ts-ignore
  delete Context._test;
  return Context;
};

export default createContext;
