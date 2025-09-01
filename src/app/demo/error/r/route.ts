import { createRouteWithIntercept } from '@/middlewares';

export const GET = createRouteWithIntercept(async () => {
  throw new Error('demo error');
});
