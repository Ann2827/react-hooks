import { useCallback } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { withSlash } from '../utils/url';

type PageRulesT = {
  paths: string[];
  available: boolean;
  redirect?: string;
};
export type PagesRulesT = {
  [key in string]?: PageRulesT;
};
type TEvent = {
  path: string;
  available: boolean;
};
type TFn = (e: TEvent) => void;

interface DataI {
  _listeners: Array<TFn>;
  _redirect: string;
  _rules: PagesRulesT;
  _event: TFn;
  init(redirect: string, rules: PagesRulesT): void;
  check(path: string): { available: boolean; redirect: string };
  navigate(path: string, navigator: NavigateFunction): void;
  set(path: string, settings: Pick<PageRulesT, 'available' | 'redirect'>): void;
  on(fn: TFn): () => void;
  reset(): void;
}

const data: DataI = {
  _listeners: [],
  _redirect: '/',
  _rules: {},
  _event(e) {
    this._listeners.forEach((listener) => listener(e));
  },
  init(redirect, rules) {
    this._redirect = withSlash(redirect);
    this._rules = rules;
  },
  check(path) {
    const page: PageRulesT | undefined = this._rules[path];
    const redirect = page?.redirect ? withSlash(page.redirect) : this._redirect;
    if (!page || page.available) {
      return { available: true, redirect };
    }

    return { available: false, redirect };
  },
  navigate(path, navigator) {
    const page: PageRulesT | undefined = this._rules[path];
    if (!page) {
      navigator(this._redirect);
      return;
    }

    if (page.available) {
      navigator(withSlash(path));
      return;
    }

    navigator(page.redirect ? withSlash(page.redirect) : this._redirect);
  },
  set(path, settings) {
    const page: PageRulesT | undefined = this._rules[path];
    if (page) {
      this._rules[path] = { ...page, ...settings };
      this._event({ path, available: settings.available });
    }
  },
  on(fn) {
    this._listeners.push(fn);
    return () => (this._listeners = this._listeners.filter((listener) => listener !== fn));
  },
  reset() {
    this._listeners = [];
    this._redirect = '/';
    this._rules = {};
  },
};

export const privatePagesInit: DataI['init'] = (redirect, rules) => data.init(redirect, rules);
export const privatePagesSet: DataI['set'] = (path, settings) => data.set(path, settings);

export type PrivatePagesT = {
  checkPage: DataI['check'];
  navigatePage: (path: string) => void;
  setPage: DataI['set'];
  on: DataI['on'];
};
const usePrivatePages = (): PrivatePagesT => {
  const navigator = useNavigate();

  const navigatePage = useCallback((path) => data.navigate(path, navigator), [navigator]);
  return {
    checkPage: (path) => data.check(path),
    navigatePage,
    setPage: (path, settings) => data.set(path, settings),
    on: (fn) => data.on(fn),
  };
};

export default usePrivatePages;
