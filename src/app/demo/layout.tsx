import { createLayout } from '@/middlewares';
import { getNextContext } from 'next-context';
import React from 'react';
import { getI18nContext, I18nProvider } from 'next-context/i18n';

function Title() {
  return <h1>root layout</h1>;
}
export default createLayout(function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, req, res, type } = getNextContext();
  res.cookie('x-user-from-layout', 'yiminghe-from-layout', {
    path: '/',
    maxAge: 60 * 60,
  });
  res.cookie('x-user-from-layout2', 'yiminghe-from-layout2', {
    path: '/',
    expires: new Date(Date.now() + 1000 * 60 * 60),
  });
  return (
    <I18nProvider>
      <html lang="en" data-user={user}>
        <body>
          <Title />
          <div>url: {req.url}</div>
          <div>type: {type}</div>
          <div>user: {user}</div>
          <h1>children</h1>
          {children}
        </body>
      </html>
    </I18nProvider>
  );
});
