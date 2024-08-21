import React from 'react';

import { IMessages } from './messages.types';
import MessagesStore from './messagesStore';

const useMessages = (): IMessages => {
  // const counter = MessagesStore.useSubscribe<number>((state) => state.counter);

  return {
    // counter,
    parse: React.useCallback<IMessages['parse']>(MessagesStore.parse, []),
    useSubscribe: React.useCallback<IMessages['useSubscribe']>(MessagesStore.useSubscribe, []),
    reset: React.useCallback<IMessages['reset']>(MessagesStore.reset, []),
  };
};

export default useMessages;
