#! /usr/bin/env node

import { PlainObjectType } from './lib/types';
import { ChameleonOptions } from './lib/interfaces';
import * as chameleon from './';
import chalk from 'chalk';
import yargs from 'yargs';
import { getOptionsFromConfigFile } from './options';
import { deepMerge } from './util';

const { argv } = yargs
  .boolean(['css', 'scss', 'cApply', 'cPreserve', 'swApply', 'swNonScaling', 'tApply'])
  .string(['config', 'path', 'dest', 'name', 'cssDest', 'cssName', 'scssDest', 'scssName', 'cName', 'cCustomVars', 'swName', 'swCustomVars', 'tName', 'tDefault']);

(async () => {
  try {
    const configOptions: Partial<ChameleonOptions> = await getOptionsFromConfigFile(argv.config);
    const cliOptions: Partial<ChameleonOptions> = getOptionsAsObject();
    const options: Partial<ChameleonOptions> = deepMerge<Partial<ChameleonOptions>>(configOptions, cliOptions);

    await chameleon.create(options);
  } catch (err) {
    console.error(chalk.redBright(err));
  }
})();

function getOptionsAsObject(): ChameleonOptions {
  const css = Object.assign({},
    argv.css !== undefined && { create: argv.css },
    typeof argv.cssDest === 'string' && { dest: argv.cssDest },
    typeof argv.cssName === 'string' && { name: argv.cssName },
  );

  const scss = Object.assign({},
    argv.scss !== undefined && { create: argv.scss },
    typeof argv.scssDest === 'string' && { dest: argv.scssDest },
    typeof argv.scssName === 'string' && { name: argv.scssName },
  );

  const colors = Object.assign({},
    argv.cApply !== undefined && { apply: argv.cApply },
    typeof argv.cName === 'string' && { name: argv.cName },
    argv.cPreserve !== undefined && { preserveOriginal: argv.cPreserve },
    typeof argv.cCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.cCustomVars) }
  );

  const strokeWidths = Object.assign({},
    argv.swApply !== undefined && { apply: argv.swApply },
    typeof argv.swName === 'string' && { name: argv.swName },
    argv.swNonScaling !== undefined && { nonScaling: argv.swNonScaling },
    typeof argv.swCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.swCustomVars) }
  );

  const transition = Object.assign({},
    argv.tApply !== undefined && { apply: argv.tApply },
    typeof argv.tName === 'string' && { name: argv.tName },
    typeof argv.tDefault === 'string' && { default: argv.tDefault },
  );

  return Object.assign({},
    typeof argv.path === 'string' && { path: argv.path },
    typeof argv.dest === 'string' && { dest: argv.dest },
    typeof argv.name === 'string' && { name: argv.name },
    { dimensionStyles: { css, scss } },
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
    if (pairSplits.length !== 2) {
      throw new Error("Couldn't parse format for custom vars! Please use '<to-replace>:<custom-var-name>'.");
    }
    obj[pairSplits[0]] = pairSplits[1];
  });

  return obj;
}
