import globalThis from './globalThis';
import { unstable_headers } from 'expo-router/rsc/headers';
import { AsyncLocalStorage } from 'async_hooks';
globalThis.__next_context_headers = async () => {
  const originals = await unstable_headers();
  const headers: any = {};
  for (const h of Array.from(originals.keys())) {
    headers[h] = originals.get(h);
  }
  return headers;
};

globalThis.AsyncLocalStorage = AsyncLocalStorage;

globalThis.__next_context_cookies = async () => {
  return {};
};
