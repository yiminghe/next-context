import { getNextContext } from '../set-context';
import { I18nContext } from '../types';
import { I18nKey } from './instance';

export function getI18nContext(): I18nContext {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // @ts-ignore
  // console.log('server getI18nContext()');
  return getNextContext()[I18nKey];
}

export { I18nProvider } from './index';

export { middleware } from './instance';
