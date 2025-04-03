import { getI18nContext } from 'next-context/i18n';

export function SharedT() {
  const { x, t } = getI18nContext();
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
        T: {t('c', { c: '2', s: (chunks) => <strong>{chunks}</strong> })}
      </div>
    </div>
  );
}
