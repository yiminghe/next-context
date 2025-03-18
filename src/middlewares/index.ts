import en from '@/i18n/en-US.json';
import zh from '@/i18n/zh-CN.json';
import {
  NextContext,
  NextFunction,
  withLayoutMiddlewares,
  withPageMiddlewares,
  withActionMiddlewares,
  withRouteMiddlewares,
} from 'next-context';
import { middleware as i18n } from 'next-context/i18n';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function user(context: NextContext, next: NextFunction) {
  console.log('begin run user middleware ' + Date.now());
  await sleep(500);
  context.user = 'test';
  console.log('end run user middleware ' + Date.now());
  await next();
}

const i18nMiddleware = i18n(async (context) => {
  const locale = (context.req.query.locale as any) || 'zh-CN';
  const messages = locale === 'zh-CN' ? zh : en;
  context.messages = messages;
  return {
    messages,
    locale,
  };
});

export const createPage = withPageMiddlewares([user, i18nMiddleware]);
export const createLayout = withLayoutMiddlewares([user]);
export const createAction = withActionMiddlewares([user]);
export const createRoute = withRouteMiddlewares([user, i18nMiddleware]);
