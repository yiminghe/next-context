'use server';

import { createAction } from '@/middlewares';
import { getNextContext } from 'next-context';
import { testTime } from '../services/getTime';

export default createAction(async (time: number) => {
  return {
    ...(await testTime()),
    time,
    user: getNextContext().user,
    type: getNextContext().type,
  };
});
