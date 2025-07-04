import { getNextContext } from 'next-context';
import { getI18nContext } from 'next-context/i18n';
import { createRouteWithI18n } from '@/middlewares';
import { testTime } from '../services/getTime';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const GET = createRouteWithI18n(async function Get(...args) {
  const context = getNextContext();
  const { user, res, type } = context;

  const t = getI18nContext().t;
  context.extraContent = {
    from: 'route',
  };
  await sleep(1000);
  res.cookie('x-user-from-route', 'yiminghe-from-route', {
    path: '/',
    maxAge: 60 * 60,
  });
  res.cookie('x-user-from-route2', 'yiminghe-from-route2', {
    path: '/',
    expires: new Date(Date.now() + 1000 * 60 * 60),
  });
  res.set('x-from', 'next-compose');
  const times = await testTime();
  res.json({
    name: t('name'),
    ...times,
    user,
    i18nPayload: getI18nContext().payload,
    user2: getNextContext().user,
    type,
    ...context.extraContent,
  });
});
