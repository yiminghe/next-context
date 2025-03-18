import IntlMessageFormat from 'intl-messageformat';
import { memoize } from '@formatjs/fast-memoize';
import type { NextFunction, NextContext } from '../types';

export type Messages = Record<string, string>;
const formatters = {
  formatters: {
    getNumberFormat: memoize(
      (locale, opts) => new Intl.NumberFormat(locale, opts),
    ),
    getDateTimeFormat: memoize(
      (locale, opts) => new Intl.DateTimeFormat(locale, opts),
    ),
    getPluralRules: memoize(
      (locale, opts) => new Intl.PluralRules(locale, opts),
    ),
  },
};

const cache = new Map<string, Map<string, IntlMessageFormat>>();

const instanceMap = new Map<any, any>();

export function getI18nInstance(
  locale: string,
  messages: Messages,
  cacheKey?: any,
): { t: any; locale: string } {
  cacheKey = cacheKey || locale;
  let instance: any = instanceMap.get(cacheKey);
  if (!instance) {
    let formatterCache = cache.get(locale);
    if (!formatterCache) {
      formatterCache = new Map<string, IntlMessageFormat>();
      cache.set(locale, formatterCache);
    }
    instance = {
      locale,
      t(key: any, values: any) {
        const message = messages[key];
        let formatter = formatterCache.get(message);
        if (!formatter) {
          formatter = new IntlMessageFormat(
            message,
            locale,
            undefined,
            formatters,
          );
          formatterCache.set(message, formatter);
        }
        return formatter.format(values);
      },
    } as any;
    instanceMap.set(cacheKey, instance);
  }

  return instance;
}

/**
 * i18n next-context middleware
 * @public
 */
export function middleware(
  init: (ctx: NextContext) => Promise<{
    messages: Record<string, string>;
    locale: string;
    cacheKey?: string;
  }>,
) {
  return async (ctx: NextContext, next: NextFunction) => {
    ctx.i18n = ctx.i18n || {};
    const { messages, locale, cacheKey } = await init(ctx);
    Object.assign(ctx.i18n, getI18nInstance(locale, messages, cacheKey));
    await next();
  };
}
