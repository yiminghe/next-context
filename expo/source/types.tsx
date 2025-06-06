/* c8 ignore start */

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
export type ClientCookies = {
  [key: string]: {
    value: string;
    options: ClientCookieAttributes;
  };
};
/**
 * request
 * @public
 */
export type NextContextRequest = {
  params: Record<string, string | string[]>;
  host: string;
  protocol: string;
  secure: boolean;
  url: string;
  basePath: string;
  ip: string | undefined;
  get: (k: string) => string | undefined;
  header: (k: string) => string | undefined;
  text: () => Promise<string>;
  json: () => Promise<any>;
  method: string;
  path: string;
  query: Record<string, string | undefined>;
  cookies: Record<string, string | undefined>;
  headers: Record<string, string | undefined>;
};

/**
 * response
 * @public
 */
export type NextContextResponse = {
  clearCookie: (name: string, options?: CookieAttributes) => void;
  cookie: (name: string, value: string, options?: CookieAttributes) => void;
  append: (k: string, v: string) => void;
  set: (...args: [key: string, v: any] | [o: any]) => void;
  get: (key: string) => any;
  redirect: (r: string) => void;
  json: (j: any) => void;
  status: (s: number) => void;
};
/**
 * context type
 * @public
 */
export type NextContextType = 'page' | 'route' | 'action';

/**
 * i18n context
 * @public
 */
export interface I18nContext {}

export interface I18nConfig {
  messages: Record<string, string>;
  locale: string;
  timeZone?: string;
  cacheKey?: string;
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
export type NextContextResponseInternal = {
  _private: {
    cookieSent?: boolean;
    cookies?: ClientCookies;
    headers: any;
    redirectUrl?: string;
    json?: any;
    status?: number;
  };
} & NextContextResponse;
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
