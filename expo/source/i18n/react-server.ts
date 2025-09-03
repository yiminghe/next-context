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

import {
  I18nProvider as I18nProviderClient,
  type I18nProviderProps,
} from './index';
import { getI18nConfig, getI18nFromContext } from './instance';

/**
 *
 * @public
 */
export function I18nProvider(props: I18nProviderProps) {
  const config = { ...getI18nConfig(getNextContext()), ...props };
  delete config.children;
  return React.createElement(I18nProviderClient, config, props.children);
}

export { middleware } from './instance';
