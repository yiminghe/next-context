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
} from './next-context';
import {
  setPageContext,
  setRouteContext,
  requestStorage,
  isPageContextInitialized,
  getPageContext,
} from './set-context';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
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

function doRedirect(context: NextContext) {
  const { redirectUrl } = getPrivate(context);
  if (redirectUrl) {
    redirect(redirectUrl);
    return 1;
  }
  return 0;
}

function getPrivate(context: NextContext) {
  return (context.res as NextContextResponseInternal)._private;
}
/**
 * create higher order page component with middlewares
 *@public
 */
export function withPageMiddlewares(fns: MiddlewareFunction[]) {
  return function (Page: PageFunction): PageFunction {
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
      await compose(fns, context, ...args);
      if (doRedirect(context)) {
        return;
      }
      const ret = Page.apply(null, args);
      await ret;
      if (doRedirect(context)) {
        return;
      }
      const private_ = getPrivate(context);
      const { cookies } = private_;
      private_.cookieSent = true;
      return (
        <>
          {cookies && <ClientCookies key="cookies" cookies={cookies} />}
          <Fragment key="main">{ret as any}</Fragment>
        </>
      );
    };
    if (Page.name) {
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
  return function (Route: RouteFunction): RouteFunction {
    const R = async (...args: any) => {
      const r = args[0];
      const c = args[1];
      const context = await createNextContextFromRoute(r);
      if (c?.params) {
        context.req.params = await c.params;
      }
      return requestStorage().run(new Map(), async () => {
        setRouteContext(context);
        await compose(fns, context, ...args);
        if (doRedirect(context)) {
          return;
        }
        const ret = Route.apply(null, args);
        await ret;
        const { status, headers, json } = getPrivate(context);
        if (doRedirect(context)) {
          return;
        }
        if (json) {
          return NextResponse.json(json, {
            status,
            headers,
          });
        }
        return ret;
      });
    };
    if (Route.name) {
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
        await compose(fns, context, ...args);
        if (doRedirect(context)) {
          return;
        }
        const ret = action.apply(null, args);
        await ret;
        if (doRedirect(context)) {
          return;
        }
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
