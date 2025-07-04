/**
 * @packageDocumentation context shared between client and server
 */

'use client';

import { SharedContext } from '../types';

import React, { use, createContext } from 'react';

const SharedReactContext = createContext<SharedContext>(null as any);

/**
 * shared context
 * @public
 */
export function getSharedContext(): SharedContext {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return use(SharedReactContext);
}

/**
 * @public
 */
export function SharedContextProvider({
  children,
  ...config
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return <SharedReactContext value={config}>{children}</SharedReactContext>;
}
