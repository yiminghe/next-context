import { createPageWithIntercept } from '@/middlewares';
import { getNextContext } from 'next-context';

export default createPageWithIntercept(() => {
  const { res } = getNextContext();
  res.jsx();
  return <div>no intercepted</div>;
});
