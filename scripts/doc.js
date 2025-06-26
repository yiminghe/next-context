const path = require('path');
const pkgPath = path.resolve(__dirname, '../package.json');
const apiConfigPath = path.resolve(__dirname, '../config/api-extractor.json');
const fs = require('fs');
const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
const json5 = require('json5');
const pkg = json5.parse(pkgContent);
const basePackage = pkg.name;
const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf-8');
const apiConfig = json5.parse(apiConfigContent);
const docsPath = path.resolve(__dirname, '../docs');
const execSync = require('child_process').execSync;
function r(...p) {
  return path.join(__dirname, ...p);
}
function updatePkg(pkg) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  fs.writeFileSync(pkgPath + '.working', JSON.stringify(pkg, null, 2));
}

function updateApiConfig(apiConfig) {
  fs.writeFileSync(apiConfigPath, JSON.stringify(apiConfig, null, 2));
  fs.writeFileSync(
    apiConfigPath + '.working',
    JSON.stringify(apiConfig, null, 2),
  );
}

try {
  for (let key of Object.keys(pkg.exports)) {
    const originalKey = key;
    console.log('generating doc for', key);
    key = key.replace(/^\.\//g, '');

    if (key === '.') {
      key = '';
    }

    const localPkg = {
      ...pkg,
      name: basePackage + (key ? '_' + key.replace('/', '_') : ''),
    };

    const localApiConfig = {
      ...apiConfig,
      mainEntryPointFilePath: path.join(
        `<projectFolder>`,
        (pkg.exports[originalKey].types || pkg.exports[originalKey].import)
          .replace('/expo/source/', '/dist/esm/')
          .replace(/(\.d)?\.tsx?$/, '.d.ts'),
      ),
    };

    updatePkg(localPkg);
    updateApiConfig(localApiConfig);

    // --diagnostics
    execSync(
      `pnpm api-extractor run --local  &&\
pnpm api-documenter markdown --input-folder=temp --output-folder=${docsPath}`,
      { stdio: 'inherit' },
    );
    console.log('generated doc for ' + key);
  }

  const files = fs.readdirSync(docsPath);

  for (const f of files) {
    if (f.endsWith('.md')) {
      let content = fs.readFileSync(path.join(docsPath, f), 'utf-8');
      content = content.replace(/next-context[\\\w]+/g, (c) => {
        return c.replaceAll('\\_', '/');
      });
      content = content.replace(/##\s+next-context[\\\w]* package/g, (c) => {
        return (
          c
            //.replace(' next-context', 'next-context')
            .replaceAll('\\_', '/')
        );
      });
      fs.writeFileSync(path.join(docsPath, f), content);
    }
  }
} finally {
  fs.writeFileSync(pkgPath, pkgContent);
  fs.writeFileSync(apiConfigPath, apiConfigContent);
  if (fs.existsSync(pkgPath + '.working')) {
    fs.rmSync(pkgPath + '.working');
  }
  if (fs.existsSync(apiConfigPath + '.working')) {
    fs.rmSync(apiConfigPath + '.working');
  }
}
