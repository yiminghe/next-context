import { getNextContext, createMiddleware } from 'next-context';

export const middleware = createMiddleware([
  async ({ req, res }, next) => {
    req.set('x-request-id', '12345');
    res.setHeader('x-response-id', '12345');
    res.cookie('x-response-a', Date.now() + '', { maxAge: 60 });
    await next();
  },
  async (__, next) => {
    const { req } = getNextContext();
    console.log('middleware headers', req.headers);
    console.log('middleware cookies', req.cookies);
    await next();
  },
]);

export const config = {
  matcher: '/((?!_next|__|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
};
