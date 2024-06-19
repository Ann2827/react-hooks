import { useCallback, useEffect, useState } from 'react';

import { useLoader } from '../loader';
import { useToast } from '../toast';

import { DataI, HttpI } from './http.types';
import data from './data';
import { convertQuery, successFn } from './http.functions';

// TODO: add lazy useLoader and useToast?

/**
 * @deprecated use useHttps hook or HttpsStore
 */
const useHttp = (): HttpI => {
  const [error, setError] = useState<HttpI['error']>({});
  const { loaderOn: on, loaderOff: off } = useLoader();
  const { alert: toastAlert } = useToast();

  const [tokens, setTokens] = useState<DataI['tokens']>(data.getTokens());
  useEffect(() => {
    data.on((e) => {
      if (e.action === 'token') {
        setTokens(data.getTokens());
      }
    });
  }, []);
  const alert = useCallback((props) => (data.getToast() ? toastAlert(props) : () => {}), [toastAlert]);
  const loaderOn = useCallback(() => (data.getLoader() ? on : () => {}), [on]);
  const loaderOff = useCallback(() => (data.getLoader() ? off : () => {}), [off]);

  const request = useCallback(
    async (props, name?: string) => {
      let { body = null } = props;
      const {
        url,
        method = 'GET',
        headers = {},
        query = null,
        token,
        answer = true,
        toast = true,
        successMsg = '',
        loader = true,
        toastWhenCode = true,
        format = true,
        toastRules = successFn,
      } = props;
      if (data.blockRepeatWhenPending && data.getState(url) === 'pending') {
        console.error('Request was repeated but the first request still pending');
        return;
      }
      if (token && !tokens[token]) {
        console.error('No token');
        return false;
      }

      setError((prev) => Object.assign({}, prev, { [name || url]: null }));
      data.setState(url, 'pending');
      if (loader) loaderOn();
      if (body) {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }
      if (token) headers.Authorization = `Bearer ${tokens[token]}`;
      let URL = url;
      if (query) URL = `${URL}?${convertQuery(query)}`;
      try {
        const response = await fetch(URL, { method, body, headers });
        if (!answer) {
          if (loader) loaderOff();
          return true;
        }

        let httpData = await response.json();
        if (format) httpData = data.responseFormat(httpData);
        if (loader) loaderOff();

        if (!response.ok) {
          data.onError(response);

          const message = data.getError(response.status) || response.statusText;
          setError((prev) =>
            Object.assign({}, prev, {
              [name || url]: {
                text: message,
                code: httpData.statusCode || null,
              },
            }),
          );
          // @ts-ignore
          if (
            ((!httpData.errorCode && toast) || (httpData.errorCode && toast && toastWhenCode)) &&
            toastRules(httpData)
          )
            alert({ text: message.toString(), type: 'error', console: false });
          console.error(httpData.message || 'Something went wrong');

          // @ts-ignore
          if (httpData.errorCode) return httpData.errorCode;
          data.setState(url, 'error');
          return false;
        }

        if ((method === 'POST' || method === 'PUT') && toast && successMsg && toastRules(httpData))
          alert({ text: successMsg.toString(), type: 'success' });

        data.setState(url, 'success');
        return httpData;
      } catch (error_) {
        if (loader) loaderOff();
        const message = 'Something went wrong';
        setError((prev) =>
          Object.assign({}, prev, {
            [name || url]: {
              text: message,
              code: 503,
            },
          }),
        );
        if (toast && data.toastWhenBackendUnavailable && toastRules(error_))
          alert({ text: message.toString(), type: 'error' });
        // @ts-ignore
        console.error(error_?.message || message);
        data.setState(url, 'error');
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaderOn, loaderOff, alert, JSON.stringify(tokens)],
  );
  const requestByName = useCallback(
    async (name, props) => {
      const dataToFetch = data.getRequest(name, props);
      if (!dataToFetch) {
        console.error('Request not found');
        return false;
      }
      return request(dataToFetch, name);
    },
    [request],
  );

  const clearError = useCallback(() => {
    setError({});
  }, []);

  return {
    request: (props) => request(props),
    error,
    clearError,
    setToken: useCallback((name, value) => data.setToken(name, value), []),
    setErrors: useCallback((props) => data.setInit({ errors: props }), []),
    requestByName,
    ready: useCallback((requestName) => data.checkReady(requestName), []),
    _reset: () => {},
  };
};

export default useHttp;
