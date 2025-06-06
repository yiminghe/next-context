const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function r(...p) {
  return path.join(__dirname, ...p);
}
const pkg = require('../package.json');

pkg.exports = {
  '.': {
    types: './dist/index.d.ts',
    default: './dist/index.js',
  },
  './expo': {
    types: './dist/expo.d.ts',
    default: './dist/expo.js',
  },
  './middleware': {
    types: './dist/middleware.d.ts',
    default: './dist/middleware.js',
  },
  './i18n': {
    types: './dist/i18n/index.d.ts',
    'react-server': './dist/i18n/react-server.js',
    default: './dist/i18n/index.js',
  },
};

fs.writeFileSync(r('../dist/package.json'), JSON.stringify(pkg, null, 2));

fs.copyFileSync(r('../README.md'), r('../dist/README.md'));
