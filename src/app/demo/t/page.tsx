import { ClientT } from '@/components/ClientT';
import { createPage } from '@/middlewares';
import { SharedT } from '@/components/SharedT';
import {
  getSharedContext,
  SharedContextProvider,
} from 'next-context/shared-context';
import { getI18nContext } from 'next-context/i18n';
export default createPage(async function TPage() {
  const d = Date.now();
  getSharedContext().p = d;
  getI18nContext().payload.z = d;
  return (
    <SharedContextProvider>
      <div>
        <SharedT />
        <hr />
        <ClientT />
      </div>
    </SharedContextProvider>
  );
});
