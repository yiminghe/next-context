'use client';

import { observer } from 'mobx-react-lite';
import { useState, useContext } from 'react';
import { ClientContext } from '../../../client-context/ClientContext';
import getUser from '../actions/getUser';
import { runWithActionName } from '@/utils/utils';

export const UserName = observer(() => {
  const user = useContext(ClientContext);
  const [ret, setRet] = useState<any>('');
  return (
    <div>
      <div>client user: {user.name}</div>
      <a
        href="#"
        data-cy="action"
        onClick={async (e) => {
          e.preventDefault();
          const res = await runWithActionName('getUser', () =>
            getUser(Date.now()),
          );
          console.log(res);
          setRet(res);
        }}>
        get user by action
      </a>
      &nbsp;
      <div>
        from action:
        {ret ? (
          <input id="action" readOnly value={JSON.stringify(ret)} />
        ) : null}
      </div>
    </div>
  );
});
