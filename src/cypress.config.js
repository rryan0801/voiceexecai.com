/* eslint-disable no-undef */
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://preview-sandbox--69f271da3dbd30c56bc97f06.base44.app',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
});