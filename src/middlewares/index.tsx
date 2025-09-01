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
import { middleware as cors } from 'next-context/cors';
import React from 'react';

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
  return {
    messages,
    locale,
  };
});

export const createPage = withPageMiddlewares([user, i18nMiddleware]);
export const createLayout = withLayoutMiddlewares([user, i18nMiddleware]);
export const createAction = withActionMiddlewares([user]);
export const createRouteWithI18n = withRouteMiddlewares([user, i18nMiddleware]);
export const createRouteWithCors = withRouteMiddlewares([
  cors({
    // origin(o){
    //   return o?.endsWith('example.com');
    // },
    exposedHeaders: ['my'],
  }),
]);
async function intercept({ req, res }: NextContext, next: NextFunction) {
  if (req.query.intercept) {
    res.json({ intercepted: true });
    res.jsx(<div>intercepted</div>);
    //await next();
  } else {
    await next();
  }
}

export const createRouteWithIntercept = withRouteMiddlewares([intercept]);
export const createPageWithIntercept = withPageMiddlewares([intercept]);
