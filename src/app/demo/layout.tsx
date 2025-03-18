import { createLayout } from '@/middlewares';
import { getNextContext } from 'next-context';
import React from 'react';

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
    <html lang="en" data-user={user}>
      <body>
        <h1>root layout</h1>
        <div>url: {req.url}</div>
        <div>type: {type}</div>
        <div>user: {user}</div>
        <h1>children</h1>
        {children}
      </body>
    </html>
  );
});
