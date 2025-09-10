/**
 * @packageDocumentation unified middleware and request context for nextjs
 */

import type {
  NextContext,
  MiddlewareFunction,
  NextContextResponseInternal,
} from './types';
import type { NextRequest } from 'next/server';
import { compose } from './compose';
import {
  createNextContextFromAction,
  createNextContextFromPage,
  createNextContextFromRoute,
  earlyReturnRoute,
  getPrivate,
} from './next-context';
import {
  setPageContext,
  setRouteContext,
  requestStorage,
  isPageContextInitialized,
  getPageContext,
} from './set-context';

import ClientCookies from './ClientCookies';
import React, { Fragment } from 'react';
import { INIT_TOKEN } from './constants';

export type {
  NextContextResponse,
  NextContextRequest,
  NextContextType,
  NextContext,
  MiddlewareFunction,
  NextFunction,
  CookieAttributes,
  I18nContext,
  I18nConfig,
  I18nPayload,
  SharedContext,
} from './types';

export {
  getNextContext,
  // attach data to context directly
  //  createNextContext,
  //  type GetSetNextContext
} from './set-context';

export { cache } from './cache';

/**
 * nextjs params
 *@public
 */
export type AsyncParams = Promise<Record<string, string | string[]>>;

/**
 * page component params
 *@public
 */
export type PageRequest = {
  params: AsyncParams;
  searchParams: AsyncParams;
};

/**
 * page component
 *@public
 */
export type PageFunction = (
  r: PageRequest,
) => React.ReactNode | Promise<React.ReactNode>;

function earlyReturnPage(context: NextContext) {
  const { jsx } = getPrivate(context);
  if (jsx) {
    return {
      ok: true,
      response: withCookiePage(context, jsx),
    };
  }
}

function withCookiePage(context: NextContext, ret?: any) {
  const private_ = getPrivate(context);
  const { cookies } = private_;
  private_.cookieSent = true;
  return (
    <>
      {cookies && <ClientCookies key="cookies" cookies={cookies} />}
      <Fragment key="main">{ret}</Fragment>
    </>
  );
}

/**
 * create higher order page component with middlewares
 *@public
 */
export function withPageMiddlewares(fns: MiddlewareFunction[]) {
  return function (Page?: PageFunction): PageFunction {
    const P = async (...args: any) => {
      const r = args[0];
      let context: NextContext;
      if (isPageContextInitialized()) {
        context = getPageContext();
      } else {
        context = createNextContextFromPage();
        setPageContext(context);
      }
      await (context as any)[INIT_TOKEN];
      if (r?.params) {
        context.req.params = await r.params;
      }
      let ret: any;
      let final: any;
      await compose(
        [
          ...fns,
          async () => {
            if (Page) {
              final = ret = Page.apply(null, args);
              if (ret && ret.then) {
                final = await ret;
              }
            }
          },
        ],
        context,
        ...args,
      );

      if (final !== undefined) {
        return withCookiePage(context, ret);
      }
      const early = earlyReturnPage(context);
      if (early && early.ok) return early.response;
    };
    if (Page?.name) {
      Object.defineProperty(P, 'name', {
        writable: true,
        value: Page.name,
      });
    }
    return P as PageFunction;
  };
}
/**
 * layout component params
 *@public
 */
export type LayoutRequest = {
  params: AsyncParams;
  children: React.ReactNode;
};
/**
 * layout component
 *@public
 */
export type LayoutFunction = (
  r: LayoutRequest,
) => React.ReactNode | Promise<React.ReactNode>;

/**
 * create higher order layout component with middlewares
 *@public
 */
export const withLayoutMiddlewares: (
  fns: MiddlewareFunction[],
) => (Layout: LayoutFunction) => LayoutFunction = withPageMiddlewares as any;

/**
 * route function
 *@public
 */
export type RouteFunction = (
  request: NextRequest,
  context: { params: AsyncParams },
) => any;

/**
 * create higher order route with middlewares
 *@public
 */
export function withRouteMiddlewares(fns: MiddlewareFunction[]) {
  return function (Route?: RouteFunction): RouteFunction {
    const R = async (...args: any) => {
      const r = args[0];
      const c = args[1];
      const context = await createNextContextFromRoute(r);
      if (c?.params) {
        context.req.params = await c.params;
      }
      return requestStorage().run(new Map(), async () => {
        setRouteContext(context);
        let ret: any;
        let final: any;
        await compose(
          [
            ...fns,
            async () => {
              if (Route) {
                final = ret = Route.apply(null, args);
                if (ret && ret.then) {
                  final = await ret;
                }
              }
            },
          ],
          context,
          ...args,
        );

        if (final !== undefined) {
          return ret;
        }
        const early = earlyReturnRoute(context);
        if (early && early.ok) return early.response;
      });
    };
    if (Route?.name) {
      Object.defineProperty(R, 'name', {
        writable: true,
        value: Route.name,
      });
    }
    return R;
  };
}

/**
 * create higher order action with middlewares
 *@public
 */
export function withActionMiddlewares(fns: MiddlewareFunction[]) {
  return function <T extends Function>(action: T): T {
    const a = async (...args: any) => {
      const context = await createNextContextFromAction();
      return requestStorage().run(new Map(), async () => {
        setRouteContext(context);
        let ret;
        await compose(
          [
            ...fns,
            async () => {
              ret = action.apply(null, args);
              if (ret && ret.then) {
                await ret;
              }
            },
          ],
          context,
          ...args,
        );
        return ret;
      });
    };
    if (action.name) {
      Object.defineProperty(a, 'name', {
        writable: true,
        value: action.name,
      });
    }
    return a as any;
  };
}
