import ExtraContextInfo from '@/app/demo/components/ExtraContextInfo';
import { getNextContext } from 'next-context';
import { createPage } from '@/middlewares';

import Link from 'next/link';
import path from 'path';

export default createPage(async function Deep() {
  const { req } = getNextContext();
  return (
    <div>
      <ExtraContextInfo />
      <Link href={path.join(req.path, '..')}>up</Link>
    </div>
  );
});
