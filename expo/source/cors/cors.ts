// https://github.com/expressjs/cors

import {
  NextContext,
  NextContextRequest,
  NextContextResponse,
  NextFunction,
} from '../types';
import { vary } from './vary';

interface Common {
  methods?: string | string[];

  credentials?: boolean;
  headers?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

interface Header {
  key: string;
  value?: any;
}

interface InternalOptions extends Common {
  origin?: string | (string | RegExp)[] | boolean | RegExp;
}

type MaybePromise<T> = T | Promise<T>;

export interface CorsOptions extends Common {
  origin?:
    | InternalOptions['origin']
    | ((origin?: string) => MaybePromise<InternalOptions['origin']>);
}

const defaults: InternalOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

function isString(s: any): s is string {
  return typeof s === 'string' || s instanceof String;
}

function isOriginAllowed(
  origin: string,
  allowedOrigin: InternalOptions['origin'],
) {
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true;
      }
    }
    return false;
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
}

function configureOrigin(options: InternalOptions, req: NextContextRequest) {
  const requestOrigin = req.headers.origin || '';
  const headers: Header[] = [];
  let isAllowed;

  if (!options.origin || options.origin === '*') {
    // allow any origin
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: '*',
    });
  } else if (isString(options.origin)) {
    // fixed origin
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: options.origin,
    });
    headers.push({
      key: 'vary',
      value: 'Origin',
    });
  } else {
    isAllowed = isOriginAllowed(requestOrigin, options.origin);
    // reflect origin
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: isAllowed ? requestOrigin : false,
    });
    headers.push({
      key: 'vary',
      value: 'Origin',
    });
  }

  return headers;
}

function configureMethods(options: InternalOptions) {
  let methods = options.methods;
  if (Array.isArray(methods)) {
    methods = methods.join(','); // .methods is an array, so turn it into a string
  }
  return {
    key: 'Access-Control-Allow-Methods',
    value: methods,
  };
}

function configureCredentials(options: InternalOptions): Header | null {
  if (options.credentials === true) {
    return {
      key: 'Access-Control-Allow-Credentials',
      value: 'true',
    };
  }
  return null;
}

function configureAllowedHeaders(
  options: InternalOptions,
  req: NextContextRequest,
) {
  let allowedHeaders = options.allowedHeaders || options.headers;
  const headers: Header[] = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
    headers.push({
      key: 'vary',
      value: 'Access-Control-Request-Headers',
    });
  } else if (Array.isArray(allowedHeaders)) {
    allowedHeaders = allowedHeaders.join(','); // .headers is an array, so turn it into a string
  }
  if (allowedHeaders && allowedHeaders.length) {
    headers.push({
      key: 'Access-Control-Allow-Headers',
      value: allowedHeaders,
    });
  }

  return headers;
}

function configureExposedHeaders(options: InternalOptions): Header | null {
  let headers = options.exposedHeaders;
  if (!headers) {
    return null;
  } else if (Array.isArray(headers)) {
    headers = headers.join(','); // .headers is an array, so turn it into a string
  }
  if (headers && headers.length) {
    return {
      key: 'Access-Control-Expose-Headers',
      value: headers,
    };
  }
  return null;
}

function configureMaxAge(options: InternalOptions): Header | null {
  const maxAge =
    (typeof options.maxAge === 'number' || options.maxAge) &&
    options.maxAge.toString();
  if (maxAge && maxAge.length) {
    return {
      key: 'Access-Control-Max-Age',
      value: maxAge,
    };
  }
  return null;
}

function applyHeaders(headers: Header[], res: NextContextResponse) {
  for (const header of headers) {
    if (header.key === 'vary' && header.value) {
      vary(res, header.value);
    } else if (header.value) {
      res.setHeader(header.key, header.value);
    }
  }
}

async function cors2(
  options: InternalOptions,
  req: NextContextRequest,
  res: NextContextResponse,
  next: NextFunction,
) {
  const headers: Header[] = [];
  const method =
    req.method && req.method.toUpperCase && req.method.toUpperCase();

  function pushHeader(head: Header | null | Header[]) {
    if (Array.isArray(head)) {
      headers.push(...head);
    } else if (head) {
      headers.push(head);
    }
  }

  if (method === 'OPTIONS') {
    // preflight
    pushHeader(configureOrigin(options, req));
    pushHeader(configureCredentials(options));
    pushHeader(configureMethods(options));
    pushHeader(configureAllowedHeaders(options, req));
    pushHeader(configureMaxAge(options));
    pushHeader(configureExposedHeaders(options));
    applyHeaders(headers, res);

    await endOptionsRequest(options, res, next);
  } else {
    // actual response
    pushHeader(configureOrigin(options, req));
    pushHeader(configureCredentials(options));
    pushHeader(configureExposedHeaders(options));
    applyHeaders(headers, res);
    await next();
  }
}

function isPromise<T>(p: Promise<T> | T): p is Promise<T> {
  return p && typeof (p as any).then === 'function';
}

async function endOptionsRequest(
  corsOptions: CorsOptions,
  res: NextContextResponse,
  next: NextFunction,
) {
  if (corsOptions.preflightContinue) {
    await next();
  } else {
    // Safari (and potentially other browsers) need content-length 0,
    //   for 204 or they just hang waiting for a body
    res.statusCode = corsOptions.optionsSuccessStatus!;
    res.setHeader('Content-Length', '0');
    res.end();
  }
}

export function middleware(
  o:
    | CorsOptions
    | ((req: NextContextRequest) => MaybePromise<CorsOptions>) = {},
) {
  return async function corsMiddleware(
    { req, res }: NextContext,
    next: NextFunction,
  ) {
    let options: CorsOptions;

    if (typeof o === 'function') {
      const t = o(req);
      if (isPromise(t)) {
        options = await t;
      } else {
        options = t;
      }
    } else {
      options = o;
    }

    const corsOptions: InternalOptions = {
      ...defaults,
      ...options,
      origin: undefined,
    };
    const originConfig = options.origin ?? defaults.origin;
    let origin = null;
    if (typeof originConfig === 'function') {
      const t = originConfig(req.headers.origin);
      if (isPromise(t)) {
        origin = await t;
      } else {
        origin = t;
      }
    } else if (originConfig) {
      origin = originConfig;
    }

    if (origin) {
      corsOptions.origin = origin;
      await cors2(corsOptions, req, res, next);
    } else if (req.method.toUpperCase() === 'OPTIONS') {
      await endOptionsRequest(corsOptions, res, next);
    } else {
      await next();
    }
  };
}
