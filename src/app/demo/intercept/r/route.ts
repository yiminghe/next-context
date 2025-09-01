import { createRouteWithIntercept } from '@/middlewares';
import { getNextContext } from 'next-context';

export const GET = createRouteWithIntercept(() => {
  const { res } = getNextContext();
  res.json({
    intercepted: false,
  });
});
