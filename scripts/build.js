import fs from 'fs';
import path from 'path';

function r(...p) {
  return path.join(import.meta.dirname, ...p);
}

function p(s, cjs = false) {
  return s
    ?.replace('expo/source', cjs ? 'cjs' : 'esm')
    .replace(/\.tsx?$/, '.js');
}
const pkg = JSON.parse(fs.readFileSync(r('../package.json'), 'utf-8'));

const exports = {};

for (const key of Object.keys(pkg.exports)) {
  let v = pkg.exports[key];
  exports[key] = {
    types: p(v.import).replace(/\.js$/, '.d.ts'),
    require: p(v.import, true),
    import: p(v.import),
    'react-server': p(v['react-server']),
  };
}

const pkg2 = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  repository: pkg.repository,
  exports,
  publishConfig: pkg.publishConfig,
  dependencies: pkg.dependencies,
};

fs.writeFileSync(r('../dist/package.json'), JSON.stringify(pkg2, null, 2));

fs.copyFileSync(r('../README.md'), r('../dist/README.md'));
