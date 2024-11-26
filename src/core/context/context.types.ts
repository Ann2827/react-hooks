export interface IContextOptions {
  /**
   * Turn on logger. By default: false
   */
  logger: boolean;

  /**
   * This hook name for logs
   */
  hookName: string;

  // TODO: не смержит сложные объекты
  /**
   * state: { started: false, changed: false }
   * Example merge=false (rewrite):
   * setState({ started: true })
   * state: { started: true }
   * Example merge=true (merge):
   * setState({ started: true })
   * state: { started: true, changed: false }
   * By default: false
   */
  merge: boolean;

  /**
   * If exists initialState then clean keys don`t exists in initialState. By default: true
   */
  cleanKeys: boolean;
}

export type TContextFn<S> = (prevState: S, newState: S) => void;

export interface IContext<S extends Object> {
  on(fn: TContextFn<S>): () => void;
  get state(): S;
  set state(newState: S);
  reset(): void;
  /**
   * @deprecated
   */
  getState(): S;
  logs(enable: boolean): void;
  get listeners(): Array<TContextFn<S>>;
}
