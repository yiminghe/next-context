import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';

const compat = new FlatCompat({
  baseDirectory: new URL('.', import.meta.url).pathname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends('next/core-web-vitals'),
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
]);
