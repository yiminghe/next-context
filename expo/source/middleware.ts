/**
 * @packageDocumentation enhanced next native middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  FORWARDED_URI_HEADER,
  NEXT_BASE_PATH_HEADER,
  NEXT_URL_HEADER,
} from './constants';
import { compose } from './compose';
import { CookieAttributes } from './types';
import { NextURL } from 'next/dist/server/web/next-url';

export type ReadonlyKV = Readonly<Record<string, string | undefined>>;
/**
 * header middleware context
 * @public
 */
export interface HeaderContext extends ContextPayload {
  req: {
    nextUrl: NextURL;
    cookies: ReadonlyKV;
    headers: ReadonlyKV;
    header: (name: string, value: string) => void;
  };
  res: {
    end: (response: NextResponse) => void;
  };
}

export interface ContextPayload {}

/**
 * response middleware context
 * @public
 */
export interface ResponseContext extends ContextPayload {
  req: {
    nextUrl: NextURL;
    cookies: ReadonlyKV;
    headers: ReadonlyKV;
  };
  res: {
    cookie: (name: string, value: string, options?: CookieAttributes) => void;
    header: (name: string, value: string) => void;
    end: (response: NextResponse) => void;
  };
}
/**
 * middleware interface for next native middleware
 * @public
 */
export interface MiddlewareMiddleware {
  header?: (arg: HeaderContext, next: () => Promise<void>) => Promise<void>;
  response?: (arg: ResponseContext, next: () => Promise<void>) => Promise<void>;
}

/**
 * nextjs middleware factory
 *@public
 */
export function createMiddleware(ms: MiddlewareMiddleware[] = []) {
  return async (nextReq: NextRequest) => {
    const { nextUrl } = nextReq;
    const requestHeaders = new Headers(nextReq.headers);
    requestHeaders.set(NEXT_URL_HEADER, nextUrl.toString());
    requestHeaders.set(NEXT_BASE_PATH_HEADER, nextUrl.basePath);
    if (!nextReq.headers.get(FORWARDED_URI_HEADER)) {
      requestHeaders.set(
        FORWARDED_URI_HEADER,
        nextUrl.basePath + nextUrl.pathname + nextUrl.search,
      );
    }
    const cookies: any = {};
    const headers: any = {};
    requestHeaders.forEach((value, key) => {
      headers[key] = value;
    });
    nextReq.cookies.getAll().forEach((cookie) => {
      cookies[cookie.name] = cookie.value;
    });
    let nextResponse: NextResponse | undefined;
    const context: HeaderContext = {
      req: {
        nextUrl,
        cookies,
        headers,
        header: (name: string, value: string) => {
          requestHeaders.set(name, value);
          headers[name] = value;
        },
      },
      res: {
        end(response) {
          nextResponse = response;
        },
      },
    };
    const headerMiddlewares = ms.map((m) => m.header).filter((m) => !!m);
    if (headerMiddlewares.length) {
      await compose(headerMiddlewares, context);
    }
    if (nextResponse) {
      return nextResponse;
    }
    nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    const { req, res, ...payload } = context;
    const responseContext: ResponseContext = {
      req: {
        nextUrl,
        cookies,
        headers,
      },
      res: {
        cookie: (name: string, value: string, options?: CookieAttributes) => {
          if (options?.maxAge === 0) {
            value = '';
          }
          nextResponse?.cookies.set(name, value, options);
          cookies[name] = value;
        },
        header: (name: string, value: string) => {
          nextResponse?.headers.set(name, value);
          headers[name] = value;
        },
        end(response) {
          nextResponse = response;
        },
      },
      ...payload,
    };
    const responseMiddlewares = ms.map((m) => m.response).filter((m) => !!m);
    if (responseMiddlewares.length) {
      await compose(responseMiddlewares, responseContext);
    }
    return nextResponse;
  };
}
