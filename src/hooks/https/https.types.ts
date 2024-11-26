import { TCacheSettings } from '../cache/cache.types';

import type { IStore, TStoreEnrich } from '@core';

/**
 * Interfaces for rewrite
 * ==========================================
 */

type THttpsRequestsConfig = Record<string, [(arg?: any) => IHttpsRequest, any, any?]>;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHttpsRequestsConfig extends THttpsRequestsConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHttpsTokenNames extends Record<'names', string> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHttpsMockNames extends Record<'names', string> {}

/**
 * Common types
 * ==========================================
 */

export type THttpsFetchInput = string;
export type THttpsStatusRequestValue = 'pending' | 'stop';
export type THttpsStatusNamedValue = 'waitToken';
export type THttpsStatusKey = keyof IHttpsRequestsConfig | THttpsFetchInput;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHttpsResponseCatch extends Record<string, unknown> {}
export type THttpsInitValidationFn<K extends keyof IHttpsRequestsConfig> = (
  dataJson: unknown,
  response?: Response,
) => dataJson is IHttpsRequestsConfig[K][1];
export type THttpsResponseObj<K extends keyof IHttpsRequestsConfig, C extends IHttpsResponseCatch = {}> = {
  response: Response;
  dataJson: IHttpsRequestsConfig[K][1] | IHttpsRequestsConfig[K][2] | C;
  validation?: THttpsInitValidationFn<K>;
};
/**
 * 'bearer' = template "Authorization:Bearer ${token}"
 * Example custom template: "x-auth:Bearer ${token}"
 */
export type THttpsTokenTemplate = 'bearer' | string;
export type THttpsTokenValue = string | null;
export interface IHttpsToken {
  token: THttpsTokenValue;
  tokenTemplate: THttpsTokenTemplate;
}

// PartialSample<IHttpsToken, 'tokenTemplate'>
export interface IHttpsFetchOptions extends Partial<IHttpsToken> {
  query?: Record<string, unknown>;
  body?: any;
  // headers, method
  mockName?: IHttpsMockNames['names'];
}

/**
 * Custom fetch types
 */

export type TCustomFetchSettings = {
  makeMock: boolean;
  mockDelay: number;
  realFallback: boolean;
};
export interface ICustomFetchOptions {
  mockName?: IHttpsMockNames['names'];
  requestName?: THttpsStatusKey;
}
export interface ICustomFetchCheckProps extends ICustomFetchOptions {
  input: RequestInfo | URL;
  init?: RequestInit;
}
export type TCustomFetchCheck = ({ input, init, mockName, requestName }: ICustomFetchCheckProps) => Response | void;
export type TCustomFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: ICustomFetchOptions,
) => Promise<Response>;

/**
 * Store types
 */

export type THttpsSettings = {
  loader: boolean;
  messages: boolean;
  waitToken: boolean;
  mockMode: boolean;
  cache: { token: Partial<Record<IHttpsTokenNames['names'], TCacheSettings['maxAge']>> };
};

export interface IHttpsRequest extends Partial<IHttpsFetchOptions> {
  url: THttpsFetchInput;
  init?: RequestInit;
  tokenName?: IHttpsTokenNames['names'];
  settings?: Partial<Omit<THttpsSettings, 'mockMode' | 'waitToken'>>;
}

// урл уходит, токен то по имени, то нет

type THttpsInitRequests = {
  [K in keyof IHttpsRequestsConfig]: IHttpsRequestsConfig[K][0];
};
type THttpsInitValidation = {
  [K in keyof IHttpsRequestsConfig]?: THttpsInitValidationFn<K>;
};
type THttpsNamedRequest = <K extends keyof IHttpsRequestsConfig>(
  name: K,
  ...arg: Parameters<IHttpsRequestsConfig[K][0]>
) => Promise<Partial<THttpsResponseObj<K>>>;
export type THttpsRequestData = IHttpsFetchOptions & {
  init?: RequestInit;
  settings?: Partial<Omit<THttpsSettings, 'mockMode' | 'waitToken'>>;
};

export type THttpsStateStatusRequest = {
  value: THttpsStatusRequestValue;
  code: number;
  timeMarker: number;
  requestCounter: number;
  onHold: boolean;
};
export type THttpsStateTokens = Record<IHttpsTokenNames['names'], IHttpsToken>;
export type THttpsState = {
  // постоянные после инита
  settings: THttpsSettings;
  namedRequests: THttpsInitRequests | null;
  validation: THttpsInitValidation | null;
  customFetch: TCustomFetch;
  // меняются
  tokens: THttpsStateTokens | null;
  status: {
    request: Partial<Record<THttpsStatusKey, THttpsStateStatusRequest>>;
    named: Partial<Record<THttpsStatusKey, THttpsStatusNamedValue>>;
  };
};

export type THttpsMockConfig = {
  namedRequests?: {
    [K in keyof IHttpsRequestsConfig]?: {
      body: Record<string, unknown>;
      init?: ResponseInit;
    };
  };
  additionalRules?: ({ input, init, mockName, requestName }: ICustomFetchCheckProps) => Response | void;
  // scenarios: Record<string, unknown>;
};
type THttpsInitialize = {
  settings: Partial<THttpsState['settings']>;
  /**
   * Uses only for namedRequest
   */
  tokens: Record<IHttpsTokenNames['names'], THttpsTokenTemplate>;
  namedRequests: THttpsInitRequests;
  validation: THttpsInitValidation;
  mocks: THttpsMockConfig;
};

export interface IHttpsData {
  initialize(initial: Partial<THttpsInitialize>): void;
  setToken(name: IHttpsTokenNames['names'], value: THttpsTokenValue): void;
  request<K extends keyof IHttpsRequestsConfig>(
    url: THttpsFetchInput,
    data?: THttpsRequestData,
  ): Promise<Partial<THttpsResponseObj<K, IHttpsResponseCatch>>>;
  namedRequest: THttpsNamedRequest;
}

export type THttpsStore = TStoreEnrich<THttpsState, IHttpsData>;

export interface IHttps {
  request: IHttpsData['request'];
  namedRequest: IHttpsData['namedRequest'];

  /**
   * Set or update token value
   */
  setToken: IHttpsData['setToken'];

  /**
   * Subscribe to the state
   */
  useSubscribe: IStore<THttpsState>['useSubscribe'];
}
