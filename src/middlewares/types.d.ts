import { I18nTranslate } from '@/i18n/types';
import type { NextContext } from 'next-context';

declare module 'next-context' {
  interface SharedContext {
    p?: number;
  }
  interface I18nPayload {
    z?: number;
  }
  interface I18nContext {
    t: I18nTranslate;
    x: string;
  }
  interface I18nConfig {
    x?: string;
  }
  interface NextContext {
    user?: string;
    extraContent?: {
      from: string;
    };
  }
}
