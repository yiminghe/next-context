import { getNextContext, createMiddleware } from 'next-context';

const middleware = createMiddleware([
  async ({ req, res }, next) => {
    let n = Date.now();
    req.set('x-request-id', String(++n));
    res.setHeader('x-response-id', String(++n));
    res.cookie('x-response-a', String(++n), { maxAge: 600 });
    await next();
  },
  async (__, next) => {
    const { req } = getNextContext();
    console.log('middleware headers', req.headers);
    console.log('middleware cookies', req.cookies);
    await next();
  },
]);

export default middleware;

export const config = {
  matcher: '/((?!_next|__|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
};
