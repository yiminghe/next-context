import { getSharedContext } from 'next-context/shared-context';
import { getI18nContext } from 'next-context/i18n';
export function SharedT() {
  const { t, x, payload } = getI18nContext();
  const sharedContext = getSharedContext();
  console.log(
    'sharedContext',
    typeof window,
    JSON.stringify(sharedContext, null, 2),
  );
  console.log('payload', typeof window, JSON.stringify(payload, null, 2));
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
      <div>payload: {JSON.stringify(payload, null, 2)}</div>
      <div>shared-context: {JSON.stringify(sharedContext, null, 2)}</div>
      <div>
        T: {t('c', { c: '2', s: (chunks) => <strong>{chunks}</strong> })}
      </div>
    </div>
  );
}
