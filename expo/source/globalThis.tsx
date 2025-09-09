import type { NextResponse } from 'next/server';
import { CookieAttributes } from './types';

declare const globalThis: {
  __next_context_response: typeof NextResponse;
  __next_context_redirect: (url: string) => void;
  __next_context_headers: () => Promise<Record<string, string>>;
  __next_context_cookies: () => Promise<Record<string, string>>;
  __next_context_clear_cookie: (
    name: string,
    options?: CookieAttributes,
  ) => Promise<void>;
  __next_context_cookie: (
    name: string,
    value: string,
    options?: CookieAttributes,
  ) => Promise<void>;
} & typeof global;

export default globalThis;
