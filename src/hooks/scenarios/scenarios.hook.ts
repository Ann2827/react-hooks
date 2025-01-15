import React from 'react';

import { IScenarios } from './scenarios.types';
import ScenariosStore from './scenariosStore';

const useScenarios = (): IScenarios => {
  return {
    after: React.useCallback<IScenarios['after']>(ScenariosStore.after, []),
    useSubscribe: React.useCallback<IScenarios['useSubscribe']>(ScenariosStore.useSubscribe, []),
    reset: React.useCallback<IScenarios['reset']>(ScenariosStore.reset, []),
  };
};

export default useScenarios;
