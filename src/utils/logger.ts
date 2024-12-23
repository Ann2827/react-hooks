export const loggerState = (
  hookName: string,
  oldState: unknown,
  newState: unknown,
  diffState: [string, string][],
  listeners?: number,
): void => {
  console.groupCollapsed(`Logger: hook ${hookName}. Changed state`);
  console.info('Old state:', oldState);
  console.info('New state:', newState);
  if (diffState.length > 0) {
    console.groupCollapsed('Diff');
    diffState.forEach(([prev, next]) => {
      if ((prev + next).length > 100) {
        console.info('Old:', prev);
        console.info('New:', next);
      } else {
        console.info('Change:', prev, '->', next);
      }
    });
    console.groupEnd();
  }
  if (listeners !== undefined) console.info('Active listeners', listeners);
  console.trace('Trace');
  console.groupEnd();
};

export const loggerMessage = (hookName: string, message: string, state?: unknown): void => {
  console.groupCollapsed(`Logger: hook ${hookName}.`, message);
  if (state) console.info('State:', state);
  console.trace('Trace');
  console.groupEnd();
};

export const loggerData = (hookName: string, description: string, logs: { message: string; data?: any }[]): void => {
  console.groupCollapsed(`Logger: hook ${hookName}.`, description);
  logs.forEach(({ message, data }) => {
    console.info(message, data || '');
  });
  console.trace('Trace');
  console.groupEnd();
};

export const loggerError = (hookName: string, description: string): void => {
  console.error(`Logger: hook ${hookName}.`, description);
};
