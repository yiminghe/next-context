'use server';

import { createAction } from '@/middlewares';
import { getNextContext } from 'next-context';
import { testTime } from '../services/getTime';
import { getI18nContext } from 'next-context/i18n';

export default createAction(async (time: number) => {
  const context = getI18nContext();
  return {
    ...(await testTime()),
    i18nLength: Object.keys(context).length,
    time,
    user: getNextContext().user,
    type: getNextContext().type,
  };
});
