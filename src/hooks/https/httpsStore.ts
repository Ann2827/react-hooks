import { IContextOptions, makeStore } from '@core';
import { loggerData, loggerMessage } from '@utils';

import { LoaderStore } from '../loader';
import { MessagesStore } from '../messages';

import {
  IHttpsData,
  IHttpsFetchOptions,
  IHttpsRequest,
  IHttpsRequestsConfig,
  IHttpsToken,
  IHttpsTokenNames,
  THttpsFetchInput,
  THttpsRequestData,
  THttpsResponseObj,
  THttpsState,
  THttpsStateTokens,
  THttpsStatusKey,
  THttpsTokenTemplate,
  THttpsStateStatusRequest,
  IHttpsResponseCatch,
  THttpsStatusNamedValue,
} from './https.types';
import { makeCustomFetch, fetchDataHandle, makeMocksFn } from './functions';

const ABORT_RATE_LIMIT_INTERVAL = 10; // sec
const ABORT_RATE_LIMIT_TRIES = 5;
const ABORT_HOLD_TIME = 30; // sec
const MOCK_DELAY = 3; // sec

const dataOptions: Partial<IContextOptions> = {
  hookName: 'https',
  logger: false,
  cleanKeys: false,
};
export const logsHttpsEnable = (): void => {
  dataOptions.logger = true;
};
const initialState: THttpsState = {
  settings: { loader: false, messages: false, mockMode: false, waitToken: false },
  namedRequests: null,
  status: { request: {}, named: {} },
  tokens: null,
  // customFetch: makeCustomFetch(() => {}, { mockDelay: MOCK_DELAY, realFallback: false, makeMock: false }),
  customFetch: window.fetch,
};

const getDiff = (msX: number, msY: number): number => {
  const msDiff = Math.abs(msY - msX);
  return Math.round(msDiff / 1000); // in seconds
};
const defaultStatusRequest: THttpsStateStatusRequest = {
  value: 'stop',
  code: 0,
  timeMarker: 0,
  requestCounter: 0,
  onHold: false,
};

const HttpsStore = makeStore<THttpsState>(initialState, dataOptions).enrich<IHttpsData>((setState, { state, on }) => {
  // Private
  const updateStatusRequest = (statusKey: THttpsStatusKey, data: Partial<THttpsStateStatusRequest>): void => {
    setState((prev) => {
      const currentStatus = prev.status.request[statusKey] || defaultStatusRequest;
      return {
        ...prev,
        status: { ...prev.status, request: { ...prev.status.request, [statusKey]: { ...currentStatus, ...data } } },
      };
    });
  };
  const updateStatusNamed = (statusKey: THttpsStatusKey, data?: THttpsStatusNamedValue): void => {
    setState((prev) => {
      return { ...prev, status: { ...prev.status, named: { ...prev.status.named, [statusKey]: data } } };
    });
  };
  const needAbort = (statusKey: THttpsStatusKey): boolean => {
    const currentTime = Date.now();
    const status = state().status.request?.[statusKey];

    if (!status) {
      updateStatusRequest(statusKey, { requestCounter: 1, timeMarker: currentTime });
      return false;
    }

    if (status.value === 'pending') return true;

    if (status.onHold && getDiff(status.timeMarker, currentTime) > ABORT_HOLD_TIME) {
      updateStatusRequest(statusKey, { requestCounter: 1, timeMarker: currentTime, onHold: false });
      return false;
    } else if (status.onHold) return true;

    const requestCounter = status.requestCounter;
    if (requestCounter > ABORT_RATE_LIMIT_TRIES) {
      if (getDiff(status.timeMarker, currentTime) > ABORT_RATE_LIMIT_INTERVAL) {
        updateStatusRequest(statusKey, { requestCounter: requestCounter + 1 });
        return false;
      } else {
        updateStatusRequest(statusKey, { requestCounter: 0, onHold: true, timeMarker: currentTime });
        console.error(`Too many requests for: ${statusKey}`);
        return true;
      }
    }

    updateStatusRequest(statusKey, { requestCounter: requestCounter + 1 });
    return false;
  };
  const getTokenByName = async (
    tokenName: IHttpsTokenNames['names'],
    waitToken: boolean,
  ): Promise<IHttpsToken | undefined> => {
    const generalToken = state().tokens?.[tokenName];

    if ((!generalToken || !generalToken?.token) && !waitToken) return;

    if (!generalToken || !generalToken?.token) {
      if (dataOptions.logger) loggerMessage(dataOptions.hookName!, `Wait for token: ${tokenName}`);

      return new Promise<IHttpsToken>((resolve) => {
        const clean = on((_prevState, newState) => {
          const awaitedToken = newState.tokens?.[tokenName];
          if (awaitedToken?.token) {
            clean();
            resolve(awaitedToken);
          }
        });
      });
    }

    return generalToken;
  };
  const makeRequest = async <T>(
    data: { url: THttpsFetchInput; init?: RequestInit; options?: Partial<IHttpsFetchOptions> },
    settings: { statusKey: THttpsStatusKey; withLoader: boolean; withMessages: boolean },
  ): Promise<Partial<THttpsResponseObj<T | IHttpsResponseCatch>>> => {
    const { url, init, options } = data;
    const { statusKey, withLoader, withMessages } = settings;

    if (needAbort(statusKey)) return {};
    updateStatusRequest(statusKey, { value: 'pending', code: 0 });

    if (withLoader) LoaderStore.activate();

    let response: Response;
    let dataJson: T | IHttpsResponseCatch;
    const fetchData = fetchDataHandle(url, init, options);
    try {
      response = await state().customFetch(...fetchData, {
        requestName: statusKey,
        mockName: options?.mockName,
      });
      dataJson = await response.json();
    } catch (error: any) {
      response = new Response(JSON.stringify({}), {
        status: 503,
        statusText: error?.message || 'Service Unavailable',
      });
      // По-хорошему тут тоже нужен try, если body станет настраиваемым
      dataJson = await response.json();
    }

    updateStatusRequest(statusKey, { value: 'stop', code: response.status });
    if (withLoader) LoaderStore.determinate();
    if (withMessages) MessagesStore.parse(response, dataJson);
    if (dataOptions.logger)
      loggerData(dataOptions.hookName!, [
        { message: `Requested ${statusKey}.` },
        { message: 'Response:', data: response },
        { message: 'DataJSON:', data: dataJson },
      ]);

    return { dataJson, response };
  };

  // Public
  const initialize: IHttpsData['initialize'] = (initial): ReturnType<IHttpsData['initialize']> => {
    const { settings, tokens, namedRequests, mocks } = initial;
    setState((prev) => {
      const update: THttpsState = { ...prev };
      if (tokens)
        update.tokens = Object.fromEntries(
          (Object.entries<THttpsTokenTemplate>(tokens) as Array<[IHttpsTokenNames['names'], THttpsTokenTemplate]>).map<
            [IHttpsTokenNames['names'], IHttpsToken]
          >(([name, template]) => [name, { token: null, tokenTemplate: template }]),
        ) as THttpsStateTokens;
      if (namedRequests) update.namedRequests = { ...namedRequests };
      if (settings) {
        update.settings = { ...prev.settings, ...settings };
      }
      update.customFetch = makeCustomFetch(makeMocksFn(mocks || {}), {
        mockDelay: MOCK_DELAY,
        realFallback: false,
        makeMock: settings?.mockMode,
      });
      return update;
    });
    if (dataOptions.logger) loggerMessage(dataOptions.hookName!, 'Was initialized', state());
  };

  const setToken: IHttpsData['setToken'] = (name, value): ReturnType<IHttpsData['setToken']> => {
    setState((prev) => {
      const tokens = prev.tokens;
      if (!tokens || !(name in tokens)) return prev;
      return { ...prev, tokens: { ...tokens, [name]: { ...tokens[name], token: value } } };
    });
  };

  const request = async <T>(
    url: THttpsFetchInput,
    data: THttpsRequestData = {},
  ): Promise<Partial<THttpsResponseObj<T | IHttpsResponseCatch>>> => {
    const { query, body, token, tokenTemplate, init, settings, mockName } = data;
    const requestData = { url, init, options: { query, body, token, tokenTemplate, mockName } };
    const generalSettings = state().settings;

    return makeRequest<T>(requestData, {
      statusKey: url,
      withLoader: settings?.loader ?? generalSettings.loader,
      withMessages: settings?.messages ?? generalSettings.messages,
    });
  };

  const namedRequest = async <K extends keyof IHttpsRequestsConfig>(
    name: K,
    ...arg: Parameters<IHttpsRequestsConfig[K][0]>
  ): Promise<Partial<THttpsResponseObj<IHttpsRequestsConfig[K][1]>>> => {
    const requestFn = state().namedRequests?.[name];
    if (!requestFn) {
      console.error(`Request by name: ${name} not found`);
      return {};
    }

    if (state().status.named?.[name] === 'waitToken') {
      console.error(`Request by name: ${name} already wait token`);
      return {};
    }

    const data: IHttpsRequest = requestFn(...arg);
    if (!data || !('url' in data)) {
      console.error(`Request by name: ${name}. Request data not found`);
      return {};
    }

    const { query, body, token, tokenTemplate, init, settings, url, tokenName, mockName } = data;
    const requestData = { url, init, options: { query, body, token, tokenTemplate, mockName } };
    const generalSettings = state().settings;

    const withLoader = settings?.loader ?? generalSettings.loader;
    if (withLoader) LoaderStore.activate();

    if (!token && tokenName) {
      updateStatusNamed(name, 'waitToken');
      const tokenByName = await getTokenByName(tokenName, generalSettings.waitToken);
      updateStatusNamed(name);
      if (!tokenByName) {
        console.error(`Request by name: ${name}. Token by name: ${tokenName} not found`);
        return {};
      }

      requestData.options.token = tokenByName.token;
      requestData.options.tokenTemplate = tokenByName.tokenTemplate;
    }

    const response = makeRequest<IHttpsRequestsConfig[K][1]>(requestData, {
      statusKey: name,
      withLoader: false,
      withMessages: settings?.messages ?? generalSettings.messages,
    });
    if (withLoader) LoaderStore.determinate();

    return response;
  };

  return {
    initialize,
    setToken,
    request,
    namedRequest,
  };
});

export default HttpsStore;
