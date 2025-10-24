import { cache } from 'react';
import type { NextContext } from './types';

const g: any = globalThis;

const cacheStore = (g.__next_compose_middlewares_context_cache =
  g.__next_compose_middlewares_context_cache || new Map());

function cacheGlobal<T>(name: string, fn: () => T): T {
  if (!cacheStore.has(name)) {
    cacheStore.set(name, fn());
  }
  return cacheStore.get(name);
}

export function createPageContext<T>(defaultValue: T): GetSetNextContext<T> {
  const ref = cache(() => ({ current: defaultValue }));

  const get = (): T => ref().current;

  const set = (value: T) => {
    ref().current = value;
  };

  return [get, set];
}

const defaultContext = cacheGlobal('defaultContext', () =>
  Object.freeze({}),
) as NextContext;

export const [getPageContext, setPageContext] = cacheGlobal(
  'getPageContext',
  () => createPageContext(defaultContext),
);

export const requestStorage = () =>
  cacheGlobal(
    'requestStorage',
    () => new AsyncLocalStorage<Map<Function, any>>(),
  );

export function createRouteContext<T>(defaultValue: T): GetSetNextContext<T> {
  const get = (): T => requestStorage().getStore()!.get(get) || defaultValue;

  const set = (v: T) => requestStorage().getStore()!.set(get, v);

  return [get, set];
}

export const [getRouteContext, setRouteContext] = cacheGlobal(
  'getRouteContext',
  () => createRouteContext(defaultContext),
);

export function isPageContextInitialized() {
  return getPageContext() !== defaultContext;
}

/**
 * get request context
 *@public
 */
export function getNextContext() {
  const context = getPageContext();
  return context == defaultContext ? getRouteContext() : context;
}

export type GetSetNextContext<T> = [() => T, (v: T) => any];

export function createNextContext<T>(c: T): GetSetNextContext<T> {
  let getSetPage: GetSetNextContext<T> = [] as any;
  let getSetRoute: GetSetNextContext<T> = [] as any;
  function init() {
    const context = getNextContext() || ({} as NextContext);
    if (context.type === 'page') {
      if (getSetPage.length) {
        return getSetPage;
      }
      getSetPage = createPageContext(c);
      return getSetPage;
    } else if (context.type === 'route' || context.type === 'action') {
      if (getSetRoute.length) {
        return getSetRoute;
      }
      getSetRoute = createRouteContext(c);
      return getSetRoute;
    }
    throw new Error('must call after middleware init');
  }
  const get = () => {
    return init()[0]();
  };
  const set = (v: T) => {
    return init()[1](v);
  };
  return [get, set];
}
