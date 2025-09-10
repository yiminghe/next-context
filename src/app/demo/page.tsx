import React from 'react';
import { getNextContext } from 'next-context';
import { createPage } from '@/middlewares';
import Link from 'next/link';
import { ClientProvider } from '@/client-context/ClientContext';
import { UserInput } from './components/UserInput';
import { UserName } from './components/UserName';
import ServerInfo from './components/ServerInfo';
import ExtraContextInfo from './components/ExtraContextInfo';
import { testTime } from './services/getTime';
import { headers } from 'next/headers';

export default createPage(async function Index() {
  const { user, req } = getNextContext();
  const times = await testTime();

  console.log();
  console.log('req headers', req.headers);
  console.log('req headers cookie', req.headers.cookie);
  console.log('req cookies', req.cookies);
  const rawCookie = (await headers()).get('cookie');
  console.log('raw cookie', rawCookie);
  console.log();

  return (
    <ClientProvider name={user!}>
      <input id="times" defaultValue={JSON.stringify(times)} />
      <ExtraContextInfo />
      <ServerInfo />
      <UserInput />
      <UserName />
      <Link href="/demo/get">get</Link> &nbsp;{' '}
      <Link href="/demo/dynamic">dynamic</Link>
    </ClientProvider>
  );
});
