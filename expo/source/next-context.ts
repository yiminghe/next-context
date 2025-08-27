import {
  type NextContext,
  type CookieAttributes,
  type NextContextResponseInternal,
  type ClientCookieAttributes,
  NextUrl,
} from './types';
import type { NextRequest } from 'next/server';
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

function buildResponse(): NextContextResponseInternal {
  const p: NextContextResponseInternal['_private'] = {
    status: 200,
    headers: {},
  };
  const res = {
    _private: p,
    clearCookie: globalThis.__next_context_clear_cookie,
    cookie: globalThis.__next_context_cookie,
    append(k: string, v: string) {
      p.headers[k] = p.headers[k] ?? '';
      p.headers[k] += v;
    },
    set(...args: any) {
      const [k, v] = args;
      if (typeof k === 'string') {
        p.headers[k] = v;
        return;
      }
      Object.assign(p.headers, k);
    },
    setHeader(k: string, v: any) {
      p.headers[k] = v;
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
    redirect(r: string) {
      p.redirectUrl = r;
    },
    end(e?: BodyInit) {
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

async function buildRequest() {
  const headers = await globalThis.__next_context_headers();
  function get(k: string) {
    return headers[k];
  }
  if (!headers[FORWARDED_URI_HEADER]) {
    console.warn('must setup middleware!');
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
    cookies: await globalThis.__next_context_cookies(),
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
    get,
    header: get,
  };
}

export function buildPageResponse() {
  const res = buildResponse();
  function cookie(name: string, value: string, options_?: CookieAttributes) {
    const private_ = res._private;
    if (private_.cookieSent) {
      throw new Error('only can set cookie inside middleware and entry page!');
    }
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
    delete (context as any)[INIT_TOKEN];
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
