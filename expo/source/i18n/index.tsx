/**
 * @packageDocumentation i18n support for nextjs
 */

'use client';

import { I18nConfig, I18nContext } from '../types';

import React, { use, createContext } from 'react';
import { getI18nInstance } from './instance';

export { onI18nContextConfig, onI18nContextInit } from './instance';

const I18nReactContext = createContext<I18nContext>(null as any);

export { middleware } from './instance';

/**
 * i18n context
 * @public
 */
export function getI18nContext(): I18nContext {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return use(I18nReactContext);
}

/**
 * I18nProviderProps
 * @public
 */
export type I18nProviderProps = {
  children?: React.ReactNode;
} & I18nConfig;

/**
 * i18n react provider
 * @public
 */
export function I18nProvider(props: I18nProviderProps) {
  const newConfig = { ...props };
  delete newConfig.children;
  const instance = getI18nInstance(newConfig);
  return <I18nReactContext value={instance}>{props.children}</I18nReactContext>;
}
