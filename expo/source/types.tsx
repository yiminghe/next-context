/* c8 ignore start */

import { NextResponse } from 'next/server';

/**
 * middle next function
 *@public
 */
export type NextFunction = () => Promise<any> | void;

/**
 * cookie attributes
 *@public
 */
export interface CookieAttributes {
  /**
   * Defines httpOnly
   */
  httpOnly?: boolean;

  /**
   * Defines the exact date when the cookie will expire.
   */
  expires?: Date | undefined;

  /**
   * Sets the cookie’s lifespan in seconds.
   */
  maxAge?: number;

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string | undefined;

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined;

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined;

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'lax' | 'none' | undefined;
}

/**
 *@internal
 */
export type ClientCookieAttributes = Omit<
  CookieAttributes,
  'maxAge' | 'expires'
> & { expires?: number | undefined };

/**
 *@internal
 */
export interface ClientCookies {
  [key: string]: {
    value: string;
    options: ClientCookieAttributes;
  };
}
/**
 *
 * @public
 */
export class NextUrl extends URL {
  basePath: string;
  constructor(url: string, basePath: string) {
    super(url);
    this.basePath = basePath || '';
    this.pathname = this.pathname.slice(this.basePath.length);
  }
  toString() {
    const url = new URL(super.toString());
    if (this.basePath) {
      url.pathname = this.basePath + url.pathname;
    }
    return url.toString();
  }
}

/**
 * header
 * @public
 */
interface HeaderOperation {
  get: (k: string) => string | undefined;
  getHeader: (k: string) => string | undefined;
  set: (k: string, v: string) => void;
  setHeader: (k: string, v: string) => void;
  header: (k: string, v?: string) => string | undefined;
}

/**
 * request
 * @public
 */
export interface NextContextRequest extends HeaderOperation {
  params: Record<string, string | string[]>;
  host: string;
  protocol: string;
  secure: boolean;
  url: string;
  nextUrl: NextUrl;
  ip: string | undefined;
  text: () => Promise<string>;
  json: () => Promise<any>;
  method: string;
  path: string;
  query: Record<string, string | undefined>;
  cookies: Record<string, string | undefined>;
  headers: Record<string, string | undefined>;
}

/**
 * response
 * @public
 */
export interface NextContextResponse extends HeaderOperation {
  clearCookie: (name: string, options?: CookieAttributes) => void;
  cookie: (name: string, value: string, options?: CookieAttributes) => void;
  append: (k: string, v: string) => void;
  redirect: (r: string) => void;
  json: (j: any) => void;
  jsx: (j?: React.ReactNode) => void;
  status: (s: number) => void;
  end: (r?: BodyInit | NextResponse) => void;
  statusCode: number;
}
/**
 * context type
 * @public
 */
export type NextContextType = 'page' | 'route' | 'action' | 'middleware';

/**
 * @public
 */
export interface I18nPayload {}

/**
 * i18n context
 * @public
 */
export interface I18nContext {
  readonly payload: I18nPayload;
}

/**
 * @public
 */
export interface SharedContext {}

/**
 *
 * @public
 */
export interface I18nConfig {
  messages?: Record<string, string>;
  locale?: string;
  timeZone?: string;
  cacheKey?: string;
  payload?: I18nPayload;
}

/**
 * request context
 * @public
 */
export interface NextContext {
  type: NextContextType;
  req: NextContextRequest;
  res: NextContextResponse;
}
/**
 * @internal
 */
export interface NextContextResponseInternal extends NextContextResponse {
  _private: {
    jsx?: React.ReactNode;
    cookieSent?: boolean;
    cookies?: ClientCookies;
    serverCookies?: ServerCookies;
    headers: any;
    json?: any;
    status?: number;
    end?: null | BodyInit | NextResponse;
  };
}

export type ServerCookies = Record<
  string,
  { value: string; options?: CookieAttributes }
>;
/**
 * @internal
 */
export interface NextContextInternal extends NextContext {
  res: NextContextResponseInternal;
}

/**
 * middleware function
 *@public
 */
export type MiddlewareFunction = (
  context: NextContext,
  next: NextFunction,
) => Promise<any> | void;
/* c8 ignore stop */
