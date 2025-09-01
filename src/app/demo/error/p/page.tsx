import { createPageWithIntercept } from '@/middlewares';

export default createPageWithIntercept(async () => {
  throw new Error('demo error');
});
