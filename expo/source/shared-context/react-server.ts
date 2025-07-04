import { getNextContext } from '../set-context';
import { SharedContext } from '../types';
import React from 'react';

const SharedContextKey = '__next_context_shared_context__';
/**
 *
 * @public
 */
export function getSharedContext(): SharedContext {
  const ctx: any = getNextContext();
  (ctx as any)[SharedContextKey] = (ctx as any)[SharedContextKey] || {};
  return (ctx as any)[SharedContextKey];
}

import { SharedContextProvider as SharedContextProvider2 } from './index';

/**
 *
 * @public
 */
export function SharedContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return React.createElement(
    SharedContextProvider2,
    getSharedContext() as any,
    children,
  );
}
