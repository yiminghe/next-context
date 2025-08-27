import { createRouteWithCors } from '@/middlewares';
import { getNextContext } from 'next-context';

export const OPTIONS = createRouteWithCors();

export const GET = createRouteWithCors(() => {
  const { res, req } = getNextContext();
  res.set('my', 'xx');
  res.json({
    t: Date.now(),
    x: req.headers.x,
  });
});

// (async function run() {
//   const res = await fetch('http://localhost:3000/demo/cors', { headers: { x: '2' } });
//   const ret = ({ data: await res.json(), headers: Array.from(res.headers) });
//   console.log('res', ret);
// })();
