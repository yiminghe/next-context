import {
  type NextContext,
  type CookieAttributes,
  type NextContextResponseInternal,
  type ClientCookieAttributes,
  NextUrl,
  ServerCookies,
  NextContextRequest,
} from './types';
import type { NextResponse, NextRequest } from 'next/server';
import {
  FORWARDED_URI_HEADER,
  FORWARDED_PROTO_HEADER,
  FORWARDED_HOST_HEADER,
  FORWARDED_FOR_HEADER,
  NEXT_BASE_PATH_HEADER,
  INIT_TOKEN,
  NEXT_URL_HEADER,
} from './constants';
import globalThis from './globalThis';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import * as cookie from 'cookie';
import { correctCookieString } from './cookies';

function buildResponse(
  req?: NextContextRequest,
  redirectFn?: RedirectFn,
): NextContextResponseInternal {
  const p: NextContextResponseInternal['_private'] = {
    status: 200,
    headers: {},
    serverCookies: req ? {} : undefined,
  };
  const serverCookies = p.serverCookies!;

  const res = {
    _private: p,
    clearCookie: req
      ? (name: string, options?: CookieAttributes) => {
          res.cookie(name, '', { ...options, maxAge: 0 });
        }
      : globalThis.__next_context_clear_cookie,
    cookie: req
      ? (name: string, value: string, options?: CookieAttributes) => {
          serverCookies[name] = { value, options };
          req.cookies[name] = value;
          const originalCookies = req.get('cookie') || '';
          req.set(
            'cookie',
            correctCookieString(originalCookies, { [name]: value }),
          );
        }
      : globalThis.__next_context_cookie,
    append(k: string, v: string) {
      p.headers[k] = p.headers[k] ?? '';
      res.setHeader(k, p.headers[k] + v);
    },
    set(...args: any) {
      const [k, v] = args;
      if (typeof k === 'string') {
        res.setHeader(k, v);
        return;
      }
      for (const [key, value] of Object.entries(k)) {
        res.setHeader(key, value);
      }
    },
    header(k: string, v?: string) {
      if (v === undefined) {
        return p.headers[k];
      }
      res.setHeader(k, v);
      return undefined;
    },
    setHeader(k: string, v: any) {
      p.headers[k] = v;
      if (req) {
        req.set(k, v);
      }
    },
    getHeader(k: string) {
      return p.headers[k];
    },
    get(k: string) {
      return p.headers[k];
    },
    status(s: number) {
      p.status = s;
    },
    json(j: any) {
      p.json = j;
    },
    jsx(j?: React.ReactNode) {
      p.jsx = j;
    },
    redirect(r: string) {
      if (redirectFn) {
        const res = redirectFn(r, p.status!);
        p.end = res;
      } else {
        globalThis.__next_context_redirect(r);
      }
    },
    end(e?: BodyInit | NextResponse) {
      p.end = e || null;
    },
    statusCode: 200,
  };
  delete (res as any).statusCode;
  Object.defineProperty(res, 'statusCode', {
    get() {
      return p.status;
    },
    set(s) {
      p.status = s;
    },
  });
  return res;
}

async function buildRequest(
  requestHeaders?: Headers,
  reqCookies?: RequestCookies,
) {
  let headers: Record<string, string> = {};
  if (requestHeaders) {
    requestHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else {
    headers = await globalThis.__next_context_headers();
  }

  let cookies: Record<string, string> = {};
  if (reqCookies) {
    reqCookies.getAll().forEach((cookie) => {
      cookies[cookie.name] = cookie.value;
    });
  } else {
    cookies = await globalThis.__next_context_cookies();
  }

  function get(k: string) {
    return headers[k];
  }
  function set(k: string, v: string) {
    headers[k] = v;
    requestHeaders?.set(k, v);
    return undefined;
  }
  if (!headers[FORWARDED_URI_HEADER]) {
    throw new Error('must setup middleware!');
  }
  let host = headers[FORWARDED_HOST_HEADER];
  if (!host) {
    throw new Error(`Missing ${FORWARDED_HOST_HEADER} header`);
  }
  if (host.includes(',')) {
    host = host.split(',')[0].trim();
  }
  const stringUrl = `${headers[FORWARDED_PROTO_HEADER]}://${host}${headers[FORWARDED_URI_HEADER]}`;
  const url = new URL(stringUrl);
  const searchParams: Record<string, any> = {};
  for (const [k, v] of Array.from(url.searchParams.entries())) {
    searchParams[k] = v;
  }
  const protocol = url.protocol.slice(0, -1);
  const nextUrl = new NextUrl(
    headers[NEXT_URL_HEADER],
    headers[NEXT_BASE_PATH_HEADER],
  );
  return {
    params: {},
    nextUrl,
    method: 'GET',
    cookies,
    text: () =>
      new Promise<string>((r) => {
        r('');
      }),
    json: () =>
      new Promise<any>((r) => {
        r({});
      }),
    host: url.host,
    secure: protocol === 'https',
    url: url.toString(),
    path: url.pathname,
    query: searchParams,
    protocol,
    ip: headers[FORWARDED_FOR_HEADER],
    headers,
    getHeader: get,
    setHeader: set,
    get,
    set,
    header(...args: [string, string?]) {
      if (args.length === 1 || args[1] === undefined) {
        return get(args[0]);
      }
      return set(args[0], args[1]);
    },
  };
}

export function buildPageResponse() {
  const res = buildResponse();
  function cookie(name: string, value: string, options_?: CookieAttributes) {
    const private_ = res._private;
    // if (private_.cookieSent) {
    //   throw new Error('only can set cookie inside middleware and entry page!');
    // }
    const { maxAge, expires, ...clientOptions_ } = options_ || {};
    let clientOptions: ClientCookieAttributes = clientOptions_;
    if (expires) {
      clientOptions.expires = +expires;
    } else if (typeof maxAge === 'number') {
      clientOptions.expires = Date.now() + maxAge * 1000;
    }
    private_.cookies = private_.cookies || {};
    private_.cookies[name] = { options: clientOptions, value };
  }
  return {
    ...res,
    cookie,
    clearCookie(name: string, options_?: CookieAttributes) {
      cookie(name, '', { ...options_, expires: new Date(0) });
    },
  };
}

export function createNextContextFromPage() {
  const context: NextContext = {
    type: 'page',
    req: null as any,
    res: buildPageResponse(),
  };
  (context as any)[INIT_TOKEN] = (async () => {
    context.req = await buildRequest();
  })();
  return context;
}

export async function createNextContextFromAction() {
  const res = buildResponse();
  const context: NextContext = {
    type: 'action',
    req: {
      ...(await buildRequest()),
      method: 'POST',
    },
    res,
  };
  return context;
}

export async function createNextContextFromRoute(req: NextRequest) {
  const context: NextContext = {
    type: 'route',
    res: buildResponse(),
    req: {
      ...(await buildRequest()),
      text: () => req.text(),
      json: () => req.json(),
      method: req.method,
    },
  };
  return context;
}

type RedirectFn = (url: string, statusCode: number) => NextResponse;

export async function createNextContextFromMiddleware(
  requestHeaders: Headers,
  nextRequest: NextRequest,
  redirectInMiddleware: RedirectFn,
) {
  const req = {
    ...(await buildRequest(requestHeaders, nextRequest.cookies)),
    text: () => nextRequest.text(),
    json: () => nextRequest.json(),
    method: nextRequest.method,
  };
  const context: NextContext = {
    type: 'middleware',
    res: buildResponse(req, redirectInMiddleware),
    req,
  };
  return context;
}

export function getPrivate(context: NextContext) {
  return (context.res as NextContextResponseInternal)._private;
}

function setHeadersToResponse(
  res: NextResponse,
  serverCookies?: ServerCookies,
  headers?: Record<string, string>,
) {
  if (serverCookies) {
    for (const key of Object.keys(serverCookies)) {
      const { value, options } = serverCookies[key];
      res.cookies.set(key, value, options);
    }
  }
  if (headers) {
    for (const key of Object.keys(headers)) {
      res.headers.set(key, headers[key]);
    }
  }
  return res;
}

export function earlyReturnRoute(context: NextContext) {
  const {
    status = 200,
    headers,
    json,
    end,
    serverCookies,
  } = getPrivate(context);
  const NextResponse = globalThis.__next_context_response;
  if (json) {
    const response = new NextResponse(JSON.stringify(json), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setHeadersToResponse(response, serverCookies, headers);
    return {
      ok: true,
      response,
    };
  } else if (end !== undefined) {
    const response =
      end instanceof NextResponse
        ? end
        : new NextResponse(end, {
            status,
          });
    setHeadersToResponse(response, serverCookies, headers);
    return {
      ok: true,
      response,
    };
  }
}
