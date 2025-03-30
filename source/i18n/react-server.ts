import { getNextContext } from '../set-context';
import { I18nContext } from '../types';
import React from 'react';

export { onI18nContextConfig, onI18nContextInit } from './instance';

export function getI18nContext(): I18nContext {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // @ts-ignore
  // console.log('server getI18nContext()');
  return getNextContext().i18n;
}

import { I18nProvider as I18nProvider2 } from './index';
import { getI18nConfig, Messages } from './instance';

export function I18nProvider({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages?: Messages;
}) {
  let config = getI18nConfig(getNextContext());
  if (messages) {
    config = {
      ...config,
      messages,
    };
  }
  return React.createElement(I18nProvider2, config, children);
}

export { middleware } from './instance';
