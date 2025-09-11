import globalThis from './globalThis';
import { redirect } from 'next/navigation';
import { cookies as getCookies, headers as getHeaders } from 'next/headers';
import type { CookieAttributes } from './types';
import { NextResponse } from 'next/server';
// import * as cookie from 'cookie';
// import { correctCookieString } from './cookies';

globalThis.__next_context_redirect = redirect;

globalThis.__next_context_response = NextResponse;

globalThis.__next_context_headers = async () => {
  const originals = await getHeaders();
  const headers: any = {};
  originals.forEach((value, key) => {
    headers[key] = value;
  });
  // already sync in middleware
  // const originalCookies = originals.get('cookie') || '';
  // const realCookies = await globalThis.__next_context_cookies();
  // // ensure always up to date
  // headers['cookie'] = correctCookieString(originalCookies, realCookies);
  return headers;
};

globalThis.__next_context_cookies = async () => {
  const originals = (await getCookies()).getAll();
  const cookies: any = {};
  for (const h of originals) {
    cookies[h.name] = h.value;
  }
  return cookies;
};

globalThis.__next_context_clear_cookie = async (
  name: string,
  options?: CookieAttributes,
) => {
  (await getCookies()).set(name, '', {
    ...options,
    maxAge: 0,
  });
};

globalThis.__next_context_cookie = async (
  name: string,
  value: string,
  options?: CookieAttributes,
) => {
  (await getCookies()).set(name, value, options);
};
