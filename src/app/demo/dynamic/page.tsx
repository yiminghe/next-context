import React from 'react';
import { getNextContext } from 'next-context';
import { createPage } from '@/middlewares';
import { ClientProvider } from '@/client-context/ClientContext';
import components from '@/components';
import Link from 'next/link';
import ExtraContextInfo from '../components/ExtraContextInfo';

let count = 0;

export default createPage(async function Dynamic() {
  const context = getNextContext();
  const { user, req, res } = context;
  res.cookie('x-user-from-page', 'yiminghe-from-page', { path: '/' });
  const cs = ++count % 2 ? ['c1'] : ['c2'];
  context.extraContent = {
    from: 'dynamic',
  };
  return (
    <ClientProvider name={user!}>
      <ExtraContextInfo />
      <div>
        <Link href={`${req.path}/deep`}>deep</Link>
        &nbsp;
        <Link href={`${req.path}/deep2`}>deep2</Link>
      </div>
      <div>
        {cs.map((id) => {
          const C = components[id];
          return <C key={id} />;
        })}
      </div>
    </ClientProvider>
  );
});
