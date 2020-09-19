#! /usr/bin/env node

const chameleon = require('./index.js');
const { argv } = require('yargs')
  .boolean(['css', 'scss', 'cl-mod','cl-preserve', 'strk-mod', 'strk-non-scaling']);

const colorOptions = Object.assign({},
  argv.clMod !== undefined && {modifiable: argv.clMod},
  typeof argv.clNaming === 'string' && {naming: argv.clNaming},
  argv.clPreserve !== undefined && {preserveOriginal: argv.clPreserve},
);

const strokeWidthOptions = Object.assign({},
  argv.strkMod !== undefined && {modifiable: argv.strkMod},
  typeof argv.strkNaming === 'string' && {naming: argv.strkNaming},
  argv.strkNonScaling !== undefined && {nonScaling: argv.strkNonScaling},
);

const options = Object.assign({},
  typeof argv.path === 'string' && {path: argv.path},
  typeof argv.subfolder === 'string' && {subfolder: argv.subfolder},
  typeof argv.name === 'string' && {name: argv.name},
  typeof argv.transition === 'string' && {transition: argv.transition},
  argv.css !== undefined && {css: argv.css},
  argv.scss !== undefined && {scss: argv.scss},
  {colors: colorOptions},
  {strokeWidths: strokeWidthOptions},
);

(async () => {
  await chameleon.create(options);
})();