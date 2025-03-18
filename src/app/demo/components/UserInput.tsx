'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useContext } from 'react';
import { ClientContext } from '../../../client-context/ClientContext';

export const UserInput = observer(() => {
  const user = useContext(ClientContext);
  const onChange = useCallback(
    (e: any) => {
      user.name = e.target.value;
      // same as
      // user.setUser(e.target.value);
    },
    [user],
  );
  return (
    <div>
      <input value={user.name} onChange={onChange} />
    </div>
  );
});
