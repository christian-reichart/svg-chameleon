#! /usr/bin/env node

import { PlainObjectType } from './lib/types';
import { ChameleonOptions } from './lib/interfaces';
import * as chameleon  from './';
import chalk from 'chalk';
import yargs from 'yargs';

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
  const args = yargs
      .boolean(['css', 'scss', 'cApply','cPreserve', 'swApply', 'swNonScaling', 'tApply']);

  const colors = Object.assign({},
      args.argv.cApply !== undefined && {apply: args.argv.cApply},
    typeof args.argv.cName === 'string' && {name: args.argv.cName},
    args.argv.cPreserve !== undefined && {preserveOriginal: args.argv.cPreserve},
    typeof args.argv.cCustomVars === 'string' && {customVars: getCustomVarsAsObject(args.argv.cCustomVars)}
  );

  const strokeWidths = Object.assign({},
    args.argv.swApply !== undefined && {apply: args.argv.swApply},
    typeof args.argv.swName === 'string' && {name: args.argv.swName},
    args.argv.swNonScaling !== undefined && {nonScaling: args.argv.swNonScaling},
    typeof args.argv.swCustomVars === 'string' && {customVars: getCustomVarsAsObject(args.argv.swCustomVars)}
  );

  const transition = Object.assign({},
    args.argv.tApply !== undefined && {apply: args.argv.tApply},
    typeof args.argv.tName === 'string' && {name: args.argv.tName},
    typeof args.argv.tDefault === 'string' && {default: args.argv.tDefault},
  );

  return Object.assign({},
    typeof args.argv.path === 'string' && {path: args.argv.path},
    typeof args.argv.subdirName === 'string' && {subdirName: args.argv.subdirName},
    typeof args.argv.fileName === 'string' && {fileName: args.argv.fileName},
    args.argv.css !== undefined && {css: args.argv.css},
    args.argv.scss !== undefined && {scss: args.argv.scss},
    { colors },
    { strokeWidths },
    { transition },
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
