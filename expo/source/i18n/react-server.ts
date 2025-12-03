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

const clientKey = ':NEXT_CONTEXT_CLIENT:';
/**
 *
 * @public
 */
export function I18nProvider(props: I18nProviderProps) {
  const serverConfig = { ...getI18nConfig(getNextContext()) };
  if (serverConfig.cacheKey) {
    serverConfig.cacheKey += clientKey;
  } else {
    (serverConfig as any)[clientKey] = clientKey;
  }
  const config = { ...serverConfig, ...props };
  delete config.children;
  return React.createElement(I18nProviderClient, config, props.children);
}

export { middleware } from './instance';
