/**
 * @packageDocumentation i18n support for nextjs
 */

'use client';

import { I18nContext, I18nConfig } from '../types';

import React, { use, createContext } from 'react';
import { getI18nInstance, Messages } from './instance';

export { onI18nContextConfig, onI18nContextInit } from './instance';

const I18nReactContext = createContext<I18nContext>(null as any);

export { middleware } from './instance';

/**
 * i18n context
 * @public
 */
export function getI18nContext(): I18nContext {
  // console.log('client getI18nContext()');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return use(I18nReactContext);
}

/**
 * i18n react provider
 * @public
 */
export function I18nProvider(props: {
  children?: React.ReactNode;
  messages?: Messages;
}) {
  let newConfig: any = { ...props };
  delete newConfig.children;
  const instance = getI18nInstance(newConfig);
  return <I18nReactContext value={instance}>{props.children}</I18nReactContext>;
}
