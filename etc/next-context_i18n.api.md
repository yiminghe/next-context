## API Report File for "next-context_i18n"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { default as React_2 } from 'react';

// Warning: (ae-forgotten-export) The symbol "I18nContext" needs to be exported by the entry point index.d.ts
//
// @public
export function getI18nContext(): I18nContext;

// @public
export function I18nProvider(props: {
    children?: React_2.ReactNode;
    messages?: Messages;
}): React_2.JSX.Element;

// Warning: (ae-forgotten-export) The symbol "NextContext" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "I18nConfig" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "NextFunction" needs to be exported by the entry point index.d.ts
//
// @public
export function middleware(config: (ctx: NextContext) => Promise<I18nConfig>): (ctx: NextContext, next: NextFunction) => Promise<void>;

// @public (undocumented)
export function onI18nContextConfig(callback: (config: I18nConfig, ctx: NextContext) => I18nConfig): void;

// @public (undocumented)
export function onI18nContextInit(callback: (instance: I18nContext, config: I18nConfig) => void): void;

// Warnings were encountered during analysis:
//
// dist/esm/i18n/index.d.ts:20:5 - (ae-forgotten-export) The symbol "Messages" needs to be exported by the entry point index.d.ts

```
