/**
 * @packageDocumentation enhanced next native middleware
 */

import type { NextRequest } from 'next/server';
import {
  FORWARDED_URI_HEADER,
  NEXT_BASE_PATH_HEADER,
  NEXT_URL_HEADER,
} from './constants';
import { compose } from './compose';
import { MiddlewareFunction } from './types';
import {
  createNextContextFromMiddleware,
  earlyReturnRoute,
} from './next-context';
import { requestStorage, setRouteContext } from './set-context';
import globalThis from './globalThis';

// type ReadonlyKV = Readonly<Record<string, string | undefined>>;

function redirectInMiddleware(url: string, statusCode: number) {
  return globalThis.__next_context_response.redirect(
    url,
    statusCode >= 300 && statusCode < 400 ? statusCode : 307,
  );
}

/**
 * nextjs middleware factory
 *@public
 */
export function createMiddleware(ms: MiddlewareFunction[] = []) {
  return async (nextReq: NextRequest) => {
    const { nextUrl } = nextReq;
    const requestHeaders = new Headers(nextReq.headers);
    const url = nextUrl.toString();
    requestHeaders.set(NEXT_URL_HEADER, url);
    requestHeaders.set(NEXT_BASE_PATH_HEADER, nextUrl.basePath);
    if (!nextReq.headers.get(FORWARDED_URI_HEADER)) {
      requestHeaders.set(
        FORWARDED_URI_HEADER,
        nextUrl.basePath + nextUrl.pathname + nextUrl.search,
      );
    }
    const context = await createNextContextFromMiddleware(
      requestHeaders,
      nextReq,
      redirectInMiddleware,
    );

    return requestStorage().run(new Map(), async () => {
      setRouteContext(context);

      let next = true;

      if (ms.length) {
        next = false;
        await compose(
          [
            ...ms,
            () => {
              next = true;
            },
          ],
          context,
        );
      }

      let early = earlyReturnRoute(context);

      if (early?.ok) {
        return early.response;
      }

      if (next) {
        context.res.end(
          globalThis.__next_context_response.next({
            request: {
              headers: requestHeaders,
            },
          }),
        );

        early = earlyReturnRoute(context);

        if (early?.ok) {
          return early.response;
        }
      }

      return new globalThis.__next_context_response('Empty Response', {
        status: 500,
      });
    });
  };
}
