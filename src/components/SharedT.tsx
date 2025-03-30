import { getI18nContext } from 'next-context/i18n';

export function SharedT() {
  const t = getI18nContext().t!;
  const x = getI18nContext().x!;
  return (
    <div>
      <h3>{t('name')}</h3>
      <div>
        t:{' '}
        {t('n', {
          n: 'hello',
        })}
      </div>
      <div>x: {x}</div>
      <div>
        T:{' '}
        {t('c', { c: '2', s: (chunks) => <strong key="1">{chunks}</strong> })}
      </div>
    </div>
  );
}
