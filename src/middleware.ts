import { createMiddleware } from 'next-context/middleware';

declare module 'next-context/middleware' {
  export interface HeaderContext {
    foo?: string;
  }
}

export const middleware = createMiddleware([
  {
    header: async (context, next) => {
      context.foo = 'bar';
      console.log('header middleware', Date.now(), context.nextRequest.url);
      await next();
    },
    response: async (context, next) => {
      console.log(
        'response middleware',
        Date.now(),
        context.nextRequest.url,
        context.foo,
      );
      await next();
    },
  },
]);

export const config = {
  matcher: '/((?!_next|__|favicon.ico|sitemap.xml|robots.txt).*)',
};
