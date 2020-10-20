#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const chameleon = require('./index.js');
const chalk = require('chalk');
const { argv } = require('yargs')
    .boolean(['css', 'scss', 'c-apply', 'c-preserve', 'sw-apply', 'sw-non-scaling', 't-apply']);
(() => __awaiter(this, void 0, void 0, function* () {
    let opts;
    try {
        opts = getOptionsAsObject();
    }
    catch (err) {
        console.error(chalk.redBright(err));
        return;
    }
    yield chameleon.create(opts);
}))();
function getOptionsAsObject() {
    const colorOptions = Object.assign({}, argv.cApply !== undefined && { apply: argv.cApply }, typeof argv.cName === 'string' && { name: argv.cName }, argv.cPreserve !== undefined && { preserveOriginal: argv.cPreserve }, typeof argv.cCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.cCustomVars) });
    const strokeWidthOptions = Object.assign({}, argv.swApply !== undefined && { apply: argv.swApply }, typeof argv.swName === 'string' && { name: argv.swName }, argv.swNonScaling !== undefined && { nonScaling: argv.swNonScaling }, typeof argv.swCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.swCustomVars) });
    const transitionOptions = Object.assign({}, argv.tApply !== undefined && { apply: argv.tApply }, typeof argv.tName === 'string' && { name: argv.tName }, typeof argv.tDefault === 'string' && { default: argv.tDefault });
    return Object.assign({}, typeof argv.path === 'string' && { path: argv.path }, typeof argv.subdirName === 'string' && { subdirName: argv.subdirName }, typeof argv.fileName === 'string' && { fileName: argv.fileName }, argv.css !== undefined && { css: argv.css }, argv.scss !== undefined && { scss: argv.scss }, { colors: colorOptions }, { strokeWidths: strokeWidthOptions }, { transition: transitionOptions });
}
// @Todo add typing for ',' strings
function getCustomVarsAsObject(str) {
    let obj = {};
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
//# sourceMappingURL=cli.js.map