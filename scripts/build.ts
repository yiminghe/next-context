import fs from 'fs';
import path from 'path';

function r(...p: string[]) {
  return path.join(__dirname, ...p);
}

function p(s: string, cjs = false) {
  return s
    ?.replace('expo/source', cjs ? 'cjs' : 'esm')
    .replace(/\.tsx?$/, '.js');
}
const pkg = JSON.parse(fs.readFileSync(r('../package.json'), 'utf-8'));

const exports: Record<string, any> = {};

for (const key of Object.keys(pkg.exports)) {
  let v = pkg.exports[key];
  exports[key] = {};

  for (const subKey of Object.keys(v)) {
    exports[key][subKey] = p(v[subKey]);
  }
  exports[key] = {
    ...exports[key],
    types: p(v.import).replace(/\.js$/, '.d.ts'),
    require: p(v.import, true),
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
