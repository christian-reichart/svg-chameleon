#! /usr/bin/env node

const chameleon = require('./index.js');
const { argv } = require('yargs')
  .boolean(['css', 'scss', 'c-apply','c-preserve', 'sw-apply', 'sw-non-scaling', 't-apply']);

const colorOptions = Object.assign({},
  argv.cApply !== undefined && {apply: argv.cApply},
  typeof argv.cName === 'string' && {name: argv.cName},
  argv.cPreserve !== undefined && {preserveOriginal: argv.cPreserve},
);

const strokeWidthOptions = Object.assign({},
  argv.swApply !== undefined && {apply: argv.swApply},
  typeof argv.swName === 'string' && {name: argv.swName},
  argv.swNonScaling !== undefined && {nonScaling: argv.swNonScaling},
);

const transitionOptions = Object.assign({},
  argv.tApply !== undefined && {apply: argv.tApply},
  typeof argv.tName === 'string' && {name: argv.tName},
  typeof argv.tDefault === 'string' && {default: argv.tDefault},
);

const options = Object.assign({},
  typeof argv.path === 'string' && {path: argv.path},
  typeof argv.subdirName === 'string' && {subdirName: argv.subdirName},
  typeof argv.fileName === 'string' && {fileName: argv.fileName},
  argv.css !== undefined && {css: argv.css},
  argv.scss !== undefined && {scss: argv.scss},
  {colors: colorOptions},
  {strokeWidths: strokeWidthOptions},
  {transition: transitionOptions},
);

(async () => {
  await chameleon.create(options);
})();