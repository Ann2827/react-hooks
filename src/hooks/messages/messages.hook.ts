// import React from 'react';

import { IMessages } from './messages.types';
import MessagesStore from './messagesStore';

const useMessages = (): IMessages => {
  const counter = MessagesStore.useSubscribe<number>((state) => state.counter);

  return {
    counter,
    parse: MessagesStore.parse,
    useSubscribe: MessagesStore.useSubscribe,
  };
};

export default useMessages;
