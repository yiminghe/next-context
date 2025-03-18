/**
 * @packageDocumentation i18n support for nextjs
 */

'use client';

import { I18nContext } from '../types';

import React, { use, createContext } from 'react';
import { getI18nInstance, Messages } from './instance';

const I18nReactContext = createContext<{
  t: any;
  locale: string;
}>(null as any);

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
export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Messages;
}) {
  const value = getI18nInstance(locale, messages);
  return <I18nReactContext value={value}>{children}</I18nReactContext>;
}
