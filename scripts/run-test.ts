import shell from 'shelljs';
import fs from 'fs-extra';
import path from 'path';

const nyc_output = path.join(__dirname, '../.nyc_output');
const coverage = path.join(__dirname, '../coverage');
fs.ensureDir(nyc_output);

let { code } = shell.exec('pnpm run jest');
code =
  code ||
  shell.exec(`mv ${coverage}/coverage-final.json ${nyc_output}/jest.json`).code;

const cmd = ['cypress run --e2e'];
if (process.env.CYPRESS_RECORD_KEY) {
  cmd.push('--record --key', process.env.CYPRESS_RECORD_KEY);
}
code = code || shell.exec(cmd.join(' ')).code;
if (fs.existsSync(path.join(coverage, 'cypress-report'))) {
  code = code || shell.exec('sh scripts/report.sh').code;
}

shell.exit(code);
