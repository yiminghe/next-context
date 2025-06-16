const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function r(...p) {
  return path.join(__dirname, ...p);
}
const pkg = require('../package.json');

pkg.exports = {
  '.': {
    types: './esm/index.d.ts',
    require: './cjs/index.js',
    import: './esm/index.js',
  },
  './expo': {
    types: './esm/expo.d.ts',
    require: './cjs/expo.js',
    import: './esm/expo.js',
  },
  './middleware': {
    types: './esm/middleware.d.ts',
    require: './cjs/middleware.js',
    import: './esm/middleware.js',
  },
  './i18n': {
    types: './esm/i18n/index.d.ts',
    require: './cjs/i18n/index.js',
    'react-server': './esm/i18n/react-server.js',
    import: './esm/i18n/index.js',
  },
};

fs.writeFileSync(r('../dist/package.json'), JSON.stringify(pkg, null, 2));

fs.copyFileSync(r('../README.md'), r('../dist/README.md'));
