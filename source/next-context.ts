import type {
  NextContext,
  CookieAttributes,
  NextContextResponseInternal,
  ClientCookieAttributes,
} from './types';
import type { NextRequest } from 'next/server';
import { cookies as getCookies, headers as getHeaders } from 'next/headers';
import {
  NEXT_URL_HEADER,
  FORWARDED_URI_HEADER,
  FORWARDED_PROTO_HEADER,
  FORWARDED_HOST_HEADER,
  FORWARDED_FOR_HEADER,
  NEXT_BASE_PATH_HEADER,
  INIT_TOKEN,
} from './constants';
import { NextURL } from 'next/dist/server/web/next-url';

async function transformCookiesToObject(): Promise<any> {
  const originals = (await getCookies()).getAll();
  const cookies: any = {};
  for (const h of originals) {
    cookies[h.name] = h.value;
  }
  return cookies;
}

async function transformHeadersToObject(): Promise<any> {
  const originals = await getHeaders();
  const headers: any = {};
  for (const h of Array.from(originals.keys())) {
    headers[h] = originals.get(h);
  }
  return headers;
}

function buildResponse(): NextContextResponseInternal {
  const p: NextContextResponseInternal['_private'] = {
    status: 200,
    headers: {},
  };
  const res = {
    _private: p,
    async clearCookie(name: string, options?: CookieAttributes) {
      (await getCookies()).set(name, '', {
        ...options,
        maxAge: 0,
      });
    },
    async cookie(name: string, value: string, options?: CookieAttributes) {
      (await getCookies()).set(name, value, options);
    },
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
  };
  return res;
}

async function buildRequest() {
  const headers = await transformHeadersToObject();
  function get(k: string) {
    return headers[k];
  }
  if (!headers[FORWARDED_URI_HEADER]) {
    throw new Error('must setup middleware!');
  }
  const stringUrl = `${headers[FORWARDED_PROTO_HEADER]}://${headers[FORWARDED_HOST_HEADER]}${headers[FORWARDED_URI_HEADER]}`;
  const url = new URL(stringUrl);
  const searchParams: Record<string, any> = {};
  for (const [k, v] of Array.from(url.searchParams.entries())) {
    searchParams[k] = v;
  }
  const protocol = url.protocol.slice(0, -1);
  const nextUrl = new NextURL(headers[NEXT_URL_HEADER]);
  nextUrl.basePath = headers[NEXT_BASE_PATH_HEADER] || '';
  nextUrl.pathname = nextUrl.pathname.slice(nextUrl.basePath.length);
  return {
    params: {},
    method: 'GET',
    cookies: await transformCookiesToObject(),
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
    nextUrl,
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
