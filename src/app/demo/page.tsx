import React from 'react';
import { getNextContext } from 'next-context';
import { createPage } from '../../middlewares';
import Link from 'next/link';
import { ClientProvider } from '../../client-context/ClientContext';
import { UserInput } from './components/UserInput';
import { UserName } from './components/UserName';
import ServerInfo from './components/ServerInfo';
import ExtraContextInfo from './components/ExtraContextInfo';
import { testTime } from './services/getTime';

export default createPage(async function Index() {
  const { user } = getNextContext();
  const times = await testTime();
  return (
    <ClientProvider name={user!}>
      <input id="times" defaultValue={JSON.stringify(times)} />
      <ExtraContextInfo />
      <ServerInfo />
      <UserInput />
      <UserName />
      <Link href="/get">get</Link> &nbsp; <Link href="/dynamic">dynamic</Link>
    </ClientProvider>
  );
});
