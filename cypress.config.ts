import { defineConfig } from 'cypress';
import codeCoverage from '@cypress/code-coverage/task';

export default defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'coverage/cypress-report',
    overwrite: false,
    html: false,
    json: true,
  },
  projectId: '5v7p13',
  env: {
    codeCoverage: {
      url: 'http://localhost:3000/tests/coverage',
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      codeCoverage(on, config);
      return config;
    },
    baseUrl: 'http://localhost:3000/demo',
  },
});
