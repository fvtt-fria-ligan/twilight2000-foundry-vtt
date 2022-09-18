import { existsSync, readFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

import c from 'chalk';

const MODULEPATH = 'static/system.json';
const FILENAME = 'pathconfig';
const BASEPATH = 'Data/systems';
let DATAPATH;
let PKG;

try {
  DATAPATH = readFileSync(`./${FILENAME}`, 'utf-8').trim();
  const temp = readFileSync(MODULEPATH);
  PKG = JSON.parse(temp);
}
catch (error) {
  console.error(`Could not read ${c.blue('package.json')}, or ${c.blue(FILENAME)}. See error for further details.`);
  throw error;
}

if (!existsSync(resolve(DATAPATH))) {
  console.error(c.red(`${c.bold('Error:')} ${c.gray(`The path ${c.blue(c.underline(DATAPATH))} does not exist`)}`));
  process.exit(0);
}

try {
  const symlink = () => symlinkSync(resolve('./dist'), resolve(join(DATAPATH, `${BASEPATH}/${PKG.id}`)));
  const path = resolve(join(DATAPATH, `${BASEPATH}/${PKG.id}`));
  if (!existsSync(resolve('./dist'))) mkdirSync(resolve('./dist'));
  if (existsSync(path)) {
    if (process.argv[2] !== '--force') {
      console.error(
        c.red(
          `${c.bold('Error:')} ${c.gray(
            `The path ${c.blue(path)} already exists.\nYou can force a symlink by using --force`,
          )}`,
        ),
      );
      process.exit(0);
    }
    else rmSync(path, { recursive: true });
  }
  symlink();
}
catch (error) {
  console.error(error);
  process.exit(0);
}

console.info(
  c.green(
    `${c.bold('Success:')} ${c.gray(
      `Symlink created at ${c.blue(resolve(join(DATAPATH, `${BASEPATH}/${PKG.id}`)))}`,
    )}`,
  ),
);
