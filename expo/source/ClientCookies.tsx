'use client';

import { useLayoutEffect } from 'react';
import type { ClientCookies, CookieAttributes } from './types';
import * as Cookies from './cookies';

export default function ClientCookies({
  cookies,
}: {
  cookies?: ClientCookies;
}) {
  useLayoutEffect(() => {
    if (cookies) {
      for (const key of Object.keys(cookies)) {
        const { value, options } = cookies[key]!;
        const { expires, ...clientOptions_ } = options || {};
        const clientOptions: CookieAttributes = clientOptions_;
        if (typeof expires === 'number') {
          clientOptions.expires = new Date(expires);
        }
        Cookies.set(key, value, clientOptions);
      }
    }
  }, [cookies]);
  return null;
}
