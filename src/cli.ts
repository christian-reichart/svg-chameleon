#! /usr/bin/env node

import { PlainObjectType } from './lib/types';
import { ChameleonOptions } from './lib/interfaces';

const chameleon = require('./index.js');
const chalk = require('chalk');
const { argv } = require('yargs')
  .boolean(['css', 'scss', 'c-apply','c-preserve', 'sw-apply', 'sw-non-scaling', 't-apply']);


(async () => {
  let opts;
  try {
    opts = getOptionsAsObject();
  } catch(err) {
    console.error(chalk.redBright(err));
    return;
  }
  await chameleon.create(opts);
})();

function getOptionsAsObject(): ChameleonOptions {
  const colorOptions = Object.assign({},
    argv.cApply !== undefined && {apply: argv.cApply},
    typeof argv.cName === 'string' && {name: argv.cName},
    argv.cPreserve !== undefined && {preserveOriginal: argv.cPreserve},
    typeof argv.cCustomVars === 'string' && {customVars: getCustomVarsAsObject(argv.cCustomVars)}
  );

  const strokeWidthOptions = Object.assign({},
    argv.swApply !== undefined && {apply: argv.swApply},
    typeof argv.swName === 'string' && {name: argv.swName},
    argv.swNonScaling !== undefined && {nonScaling: argv.swNonScaling},
    typeof argv.swCustomVars === 'string' && {customVars: getCustomVarsAsObject(argv.swCustomVars)}
  );

  const transitionOptions = Object.assign({},
    argv.tApply !== undefined && {apply: argv.tApply},
    typeof argv.tName === 'string' && {name: argv.tName},
    typeof argv.tDefault === 'string' && {default: argv.tDefault},
  );

  return Object.assign({},
    typeof argv.path === 'string' && {path: argv.path},
    typeof argv.subdirName === 'string' && {subdirName: argv.subdirName},
    typeof argv.fileName === 'string' && {fileName: argv.fileName},
    argv.css !== undefined && {css: argv.css},
    argv.scss !== undefined && {scss: argv.scss},
    {colors: colorOptions},
    {strokeWidths: strokeWidthOptions},
    {transition: transitionOptions},
  );
}

// @Todo add typing for ',' strings
function getCustomVarsAsObject(str: string): PlainObjectType {
  let obj: PlainObjectType = {};
  let splits = str.split(',');
  splits.forEach(pair => {
    let pairSplits = pair.split(':');
    if(pairSplits.length !== 2) {
      throw new Error("Couldn't parse format for custom vars! Please use '<to-replace>:<custom-var-name>'.");
    }
    obj[pairSplits[0]] = pairSplits[1];
  });

  return obj;
}
