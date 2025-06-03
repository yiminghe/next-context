import { createMiddleware } from 'next-context/middleware';

declare module 'next-context/middleware' {
  export interface ContextPayload {
    foo?: string;
  }
}

export const middleware = createMiddleware([
  {
    header: async (context, next) => {
      context.payload.foo = 'bar';
      console.log('header middleware', Date.now(), context.req.nextUrl.href);
      await next();
    },
    response: async (context, next) => {
      console.log(
        'response middleware',
        Date.now(),
        context.req.nextUrl.href,
        context.payload.foo,
      );
      await next();
    },
  },
]);

export const config = {
  matcher: '/((?!_next|__|favicon.ico|sitemap.xml|robots.txt).*)',
};
