import { onI18nContextConfig, onI18nContextInit } from 'next-context/i18n';

onI18nContextConfig((config) => {
  return {
    ...config,
    x: 'x_config',
  };
});

onI18nContextInit((instance, config) => {
  console.log('onI18nContextInit', Date.now(), typeof window, config);
  instance.x = config.x! + '_instance';
});
