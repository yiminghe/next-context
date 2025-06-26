import { getNextContext } from '../set-context';
import { I18nContext } from '../types';
import React from 'react';

export { onI18nContextConfig, onI18nContextInit } from './instance';

/**
 *
 * @public
 */
export function getI18nContext(): I18nContext {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return getI18nFromContext(getNextContext());
}

import { I18nProvider as I18nProvider2 } from './index';
import { getI18nConfig, getI18nFromContext, Messages } from './instance';

/**
 *
 * @public
 */
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
