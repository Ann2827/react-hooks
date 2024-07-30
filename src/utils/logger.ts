export const loggerState = (hookName: string, oldState: unknown, newState: unknown): void => {
  console.group(`Hook ${hookName}`);
  console.info('Old state:', oldState);
  console.info('New state:', newState);
  console.groupCollapsed('Trace');
  console.trace('Trace');
  console.groupEnd();
  console.groupEnd();
};

export const loggerMessage = (hookName: string, message: string, state?: unknown): void => {
  console.group(`Hook ${hookName}`);
  console.info(message);
  if (state) console.info('State:', state);
  console.groupCollapsed('Trace');
  console.trace('Trace');
  console.groupEnd();
  console.groupEnd();
};

export const loggerData = (hookName: string, logs: { message: string; data?: any }[]): void => {
  console.group(`Hook ${hookName}`);
  logs.forEach(({ message, data }) => {
    console.info(message, data || '');
  });
  console.groupCollapsed('Trace');
  console.trace('Trace');
  console.groupEnd();
  console.groupEnd();
};
