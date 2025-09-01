import { initI18n } from './i18n/init';

import { type Instrumentation } from 'next';
export async function register() {
  initI18n();
}

export const onRequestError: Instrumentation.onRequestError = async (
  err: any,
  request,
  context,
) => {
  console.log('onRequestError', {
    message: err.stack || err.message,
    request,
    context,
  });
};
