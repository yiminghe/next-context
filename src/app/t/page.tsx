import { ClientT } from '@/components/ClientT';
import { getI18nContext, I18nProvider } from 'next-context/i18n';
import { createPage } from '@/middlewares';
import { SharedT } from '@/components/SharedT';
import { getNextContext } from 'next-context';

export default createPage(async function TPage() {
  const { messages } = getNextContext();

  const { locale } = getI18nContext();

  return (
    <div>
      <SharedT />
      <hr />
      <I18nProvider locale={locale!} messages={messages!}>
        <ClientT />
      </I18nProvider>
    </div>
  );
});
