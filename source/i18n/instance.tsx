import IntlMessageFormat from 'intl-messageformat';
import { memoize } from '@formatjs/fast-memoize';
import type { NextFunction, NextContext } from '../types';
import { I18nContext, I18nConfig } from '../types';
import React from 'react';
export type Messages = Record<string, string>;
const formatters = {
  getNumberFormat: memoize(
    (locale, opts) => new Intl.NumberFormat(locale, opts),
  ),
  getDateTimeFormat: memoize(
    (locale, opts) => new Intl.DateTimeFormat(locale, opts),
  ),
  getPluralRules: memoize((locale, opts) => new Intl.PluralRules(locale, opts)),
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

function fixKey(values: any) {
  const ret: any = {};
  for (const key of Object.keys(values)) {
    const value = values[key];
    let fixed = value;
    if (typeof value === 'function') {
      let index = 0;
      fixed = (chunks: any) => {
        const result = value(chunks);
        return React.isValidElement(result)
          ? React.cloneElement(result, { key: key + ++index })
          : result;
      };
    }
    ret[key] = fixed;
  }
  return ret;
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
    const { cacheKey, ...validConfig } = config;
    instance = {
      [I18nConfigKey]: validConfig,
      locale,
      timeZone,
      messages,
      t(key: any, values: any) {
        const message = messages[key] || '';
        let formatter = formatterCache.get(message);
        if (!formatter) {
          formatter = new IntlMessageFormat(message, locale, formats, {
            formatters: {
              ...formatters,
              getDateTimeFormat(locales, options) {
                return formatters.getDateTimeFormat(locales, {
                  timeZone,
                  ...options,
                });
              },
            },
          });
          formatterCache.set(message, formatter);
        }
        return formatter.format(values ? fixKey(values) : values);
      },
    };
    if (onInit) {
      onInit(instance, config);
    }
    instanceCache.set(instanceKey, instance);
  }

  return instance;
}

const I18nConfigKey = '__next_context_i18n_config';

export function getI18nConfig(ctx: NextContext): I18nConfig {
  return getI18nFromContext(ctx)[I18nConfigKey] as I18nConfig;
}

const I18nContextKey = '__next_context_i18n';

export function getI18nFromContext(ctx: NextContext): any {
  return (ctx as any)[I18nContextKey];
}

export function setI18nToContext(ctx: NextContext, value: any): void {
  (ctx as any)[I18nContextKey] = value;
}

/**
 * i18n next-context middleware
 * @public
 */
export function middleware(config: (ctx: NextContext) => Promise<I18nConfig>) {
  return async (ctx: NextContext, next: NextFunction) => {
    let ret = await config(ctx);
    if (onConfig) {
      ret = onConfig(ret, ctx);
    }
    const i18nContext: any = getI18nInstance(ret);
    setI18nToContext(ctx, i18nContext);
    await next();
  };
}
