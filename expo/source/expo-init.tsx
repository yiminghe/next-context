import globalThis from './globalThis';
import { unstable_headers } from 'expo-router/rsc/headers';
globalThis.__next_context_headers = async () => {
  const originals = await unstable_headers();
  const headers: any = {};
  for (const h of Array.from(originals.keys())) {
    headers[h] = originals.get(h);
  }
  return headers;
};

globalThis.__next_context_cookies = async () => {
  return {};
};
