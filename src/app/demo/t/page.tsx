import { ClientT } from '@/components/ClientT';
import { I18nProvider } from 'next-context/i18n';
import { createPage } from '@/middlewares';
import { SharedT } from '@/components/SharedT';

export default createPage(async function TPage() {
  return (
    <div>
      <SharedT />
      <hr />
      <I18nProvider>
        <ClientT />
      </I18nProvider>
    </div>
  );
});
