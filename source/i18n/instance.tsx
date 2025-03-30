import IntlMessageFormat from 'intl-messageformat';
import { memoize } from '@formatjs/fast-memoize';
import type { NextFunction, NextContext } from '../types';
import { I18nContext, I18nConfig } from '../types';

export type Messages = Record<string, string>;
const formatOptions = {
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

const g: any = typeof window !== 'undefined' ? window : globalThis;

const formatterCaches: Map<any, any> =
  g.__NEXT_CONTEXT_I18N_FORMAT_CACHE ||
  (g.__NEXT_CONTEXT_I18N_FORMAT_CACHE = new Map<string, any>());

const instanceCaches: Map<any, any> =
  g.__NEXT_CONTEXT_I18N_INSTANCE_CACHE ||
  (g.__NEXT_CONTEXT_I18N_INSTANCE_CACHE = new Map<string, any>());

let onInit: ((instance: I18nContext, config: I18nConfig) => void) | undefined;
let onConfig:
  | ((instance: I18nConfig, ctx: NextContext) => I18nConfig)
  | undefined;

export function onI18nContextInit(
  callback: (instance: I18nContext, config: I18nConfig) => void,
) {
  onInit = callback;
}

export function onI18nContextConfig(
  callback: (config: I18nConfig, ctx: NextContext) => I18nConfig,
) {
  onConfig = callback;
}

function setTimeZoneInOptions(
  opts: Record<string, Intl.DateTimeFormatOptions>,
  timeZone: string,
): Record<string, Intl.DateTimeFormatOptions> {
  return Object.keys(opts).reduce(
    (all: Record<string, Intl.DateTimeFormatOptions>, k) => {
      all[k] = {
        timeZone,
        ...opts[k],
      };
      return all;
    },
    {},
  );
}

function getCacheByPath(map: Map<any, any>, keys: any[]) {
  let cache = map;
  for (const key of keys) {
    if (!cache.has(key)) {
      cache.set(key, new Map());
    }
    cache = cache.get(key);
  }
  return cache;
}

const instanceKey = '__instance';

export function getI18nInstance(config: I18nConfig): I18nContext {
  const { locale, messages, timeZone = '' } = config;
  const c: any = config;
  const cacheKeyPath = config.cacheKey
    ? [config.cacheKey]
    : Object.keys(c)
        .filter((k) => typeof c[k] === 'string')
        .map((k) => c[k]);
  const instanceCache = getCacheByPath(instanceCaches, cacheKeyPath);
  let instance: any = instanceCache.get(instanceKey);
  if (!instance) {
    let formatterCache = getCacheByPath(formatterCaches, [locale, timeZone]);
    const mfFormats = IntlMessageFormat.formats;
    const formats = timeZone
      ? {
          date: setTimeZoneInOptions(mfFormats.date, timeZone),
          time: setTimeZoneInOptions(mfFormats.time, timeZone),
        }
      : undefined;
    instance = {
      locale,
      timeZone,
      t(key: any, values: any) {
        const message = messages[key];
        let formatter = formatterCache.get(message);
        if (!formatter) {
          formatter = new IntlMessageFormat(
            message,
            locale,
            formats,
            formatOptions,
          );
          formatterCache.set(message, formatter);
        }
        return formatter.format(values);
      },
    };
    if (onInit) {
      onInit(instance, config);
    }
    instanceCache.set(instanceKey, instance);
  }

  return instance;
}

const KEY = '__config';

export function getI18nConfig(ctx: NextContext): I18nConfig {
  return (ctx.i18n as any)[KEY] as I18nConfig;
}

/**
 * i18n next-context middleware
 * @public
 */
export function middleware(config: (ctx: NextContext) => Promise<I18nConfig>) {
  return async (ctx: NextContext, next: NextFunction) => {
    ctx.i18n = ctx.i18n || {};
    let ret = await config(ctx);
    if (onConfig) {
      ret = onConfig(ret, ctx);
    }
    Object.assign(ctx.i18n, getI18nInstance(ret));
    (ctx.i18n as any)[KEY] = ret;
    await next();
  };
}
