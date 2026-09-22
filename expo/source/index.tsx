/**
 * @packageDocumentation unified middleware and request context for next.js
 */

import './next-init';

export * from './common';
export { createMiddleware } from './middleware';
export {
  FORWARDED_URI_HEADER,
  NEXT_URL_HEADER,
  NEXT_BASE_PATH_HEADER,
} from './constants';
