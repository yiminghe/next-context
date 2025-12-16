import { describe, it, expect } from '@jest/globals';
import { getI18nInstance } from '../instance';
import { I18nContext } from '../../types';

interface MyContext extends I18nContext {
  locale: string;
  messages: Record<string, string>;
  t: any;
  payload: Record<string, any>;
}
describe('getI18nInstance', () => {
  it('should return cached i18n instance', () => {
    const config = {
      locale: 'en',
      messages: {
        hello: 'Hello',
      },
      payload: {},
    };
    const instance = getI18nInstance(config) as MyContext;
    expect(instance).toBeDefined();
    expect(instance.locale).toBe('en');
    expect(instance.messages.hello).toBe('Hello');
    expect(instance.t('hello')).toBe('Hello');
    instance.payload.x = 1;
    expect(instance.payload).toEqual({ x: 1 });

    const config2 = {
      locale: 'en',
      messages: {
        hello: 'Hello2',
      },
      payload: {},
    };

    const instance2 = getI18nInstance(config2) as MyContext;
    expect(instance2).toBeDefined();
    expect(instance2.locale).toBe('en');

    instance2.payload.x = 2;
    // payload is special
    expect(instance2.payload).toEqual({ x: 2 });
    expect(instance.payload).toEqual({ x: 1 });

    expect(instance2.messages).toBe(instance.messages);
    expect(instance.t('hello')).toBe('Hello');

    expect(instance.t).toBe(instance2.t);
    expect(instance).not.toBe(instance2);

    expect(instance.payload).not.toBe(instance2.payload);
  });
});
