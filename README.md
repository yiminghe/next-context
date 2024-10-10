# next-compose-middlewares
- Using koa style middlewares inside nextjs
- Unified request/response context(express api) across Page and Route/Action
- SetCookie/clearCookie both inside Page and Route/Action
- Easily access request/response context between components inside Page and functions inside Route/Action 


[![NPM version][npm-image]][npm-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![npm download][download-image]][download-url]
![Build Status](https://github.com/yiminghe/next-compose-middlewares/actions/workflows/ci.yaml/badge.svg)
[![next-compose-middlewares](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/5v7p13/main&style=flat&logo=cypress)](https://cloud.cypress.io/projects/5v7p13/runs)

[npm-image]: http://img.shields.io/npm/v/next-compose-middlewares.svg?style=flat-square
[npm-url]: http://npmjs.org/package/next-compose-middlewares
[coveralls-image]: https://img.shields.io/coveralls/yiminghe/next-compose-middlewares.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yiminghe/next-compose-middlewares?branch=main
[node-image]: https://img.shields.io/badge/node.js-%3E=_18.0-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/next-compose-middlewares.svg?style=flat-square
[download-url]: https://npmjs.org/package/next-compose-middlewares


## demo

```
pnpm i
npm run dev
```

## Usage

### nextjs middleware
`src/middleware.ts`

```js
export { middleware } from 'next-compose-middlewares/middleware';
```

### extends type

```ts
declare module 'next-compose-middlewares' {
  interface NextContext {
    user: string;
  }
}
```

### page
`src/app/page.tsx`

```js
import React from 'react';
import { withPageMiddlewares, getNextContext } from 'next-compose-middlewares';

export default withPageMiddlewares([
  async (context, next) => {
    context.user = 'test';
    await next();
  }])(
  async () => {
    const { user } = getNextContext();
    return (
      <>
        <p>{user}</p>
      </>
    );
  },
);
```

### action
`src/action/getUser.ts`

```js
import { withActionMiddlewares, getNextContext } from 'next-compose-middlewares';

export default withActionMiddlewares([
  async (context, next) => {
    context.user = 'test';
    await next();
  }])(
  async () => {
    const { user } = getNextContext();
    return user;
  },
);
```

### route
`src/app/get/route.ts`

```js
import { withRouteMiddlewares,getNextContext } from 'next-compose-middlewares';

export const GET = withRouteMiddlewares([
  async (context, next) => {
    context.user = 'test';
    await next();
  }])(
  async () => {
    const { user, res } = getNextContext();
    res.json({ user });
  },
);
```

### nginx

```
location /rewrite {
    proxy_set_header X-Forwarded-URI $request_uri;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Host $host:$server_port;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:3000/dynamic;
}
```

## API Report File for "next-compose-middlewares"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import type { NextRequest } from 'next/server';
import { default as React_2 } from 'react';

// @public (undocumented)
export interface CookieAttributes {
    domain?: string | undefined;
    expires?: number | Date | undefined;
    // (undocumented)
    maxAge?: number;
    path?: string | undefined;
    sameSite?: 'strict' | 'lax' | 'none' | undefined;
    secure?: boolean | undefined;
}

// @public (undocumented)
export function getNextContext(): NextContext;

// @public (undocumented)
export type LayoutFunction = (r: LayoutRequest) => ReturnedRender | Promise<ReturnedRender>;

// @public (undocumented)
export type LayoutRequest = {
    params: Params;
    children: React_2.ReactNode;
};

// @public (undocumented)
export type MiddlewareFunction = (context: NextContext, next: NextFunction) => Promise<any> | void;

// @public (undocumented)
export interface NextContext {
    // (undocumented)
    req: NextContextRequest;
    // (undocumented)
    res: NextContextResponse;
    // (undocumented)
    type: NextContextType;
}

// @public (undocumented)
export type NextContextRequest = {
    params: any;
    host: string;
    protocol: string;
    secure: boolean;
    url: string;
    nextUrl: URL;
    ip: string | undefined;
    get: (k: string) => any;
    header: (k: string) => any;
    text: () => Promise<string>;
    json: () => Promise<any>;
    method: string;
    path: string;
    query: any;
    cookies: any;
    headers: any;
};

// @public (undocumented)
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

// @public (undocumented)
export type NextContextType = 'page' | 'route' | 'action';

// @public (undocumented)
export type NextFunction = () => Promise<any> | void;

// @public (undocumented)
export type PageFunction = (r: PageRequest) => ReturnedRender | Promise<ReturnedRender>;

// @public (undocumented)
export type PageRequest = {
    params: Params;
    searchParams: Params;
};

// @public (undocumented)
export type Params = Record<string, string | string[]>;

// @public (undocumented)
export type ReturnedRender = React_2.ReactNode;

// @public (undocumented)
export type RouteFunction = (request: NextRequest, context: {
    params: Params;
}) => any;

// @public (undocumented)
export function withActionMiddlewares(fns: MiddlewareFunction[]): <T extends Function>(action: T) => T;

// @public (undocumented)
export const withLayoutMiddlewares: (fns: MiddlewareFunction[]) => (Layout: LayoutFunction) => LayoutFunction;

// @public (undocumented)
export function withPageMiddlewares(fns: MiddlewareFunction[]): (Page: PageFunction) => PageFunction;

// @public (undocumented)
export function withRouteMiddlewares(fns: MiddlewareFunction[]): (Route: RouteFunction) => RouteFunction;

// (No @packageDocumentation comment for this package)

```
---------
