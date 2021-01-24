#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as chameleon from './';
import chalk from 'chalk';
import yargs from 'yargs';
(() => __awaiter(void 0, void 0, void 0, function* () {
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
    const argv = yargs
        .boolean(['css', 'scss', 'cApply', 'cPreserve', 'swApply', 'swNonScaling', 'tApply']);
    const colorOptions = Object.assign({}, argv.cApply !== undefined && { apply: argv.cApply }, typeof argv.cName === 'string' && { name: argv.cName }, argv.cPreserve !== undefined && { preserveOriginal: argv.cPreserve }, typeof argv.cCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.cCustomVars) });
    const strokeWidthOptions = Object.assign({}, argv.swApply !== undefined && { apply: argv.swApply }, typeof argv.swName === 'string' && { name: argv.swName }, argv.swNonScaling !== undefined && { nonScaling: argv.swNonScaling }, typeof argv.swCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.swCustomVars) });
    const transitionOptions = Object.assign({}, argv.tApply !== undefined && { apply: argv.tApply }, typeof argv.tName === 'string' && { name: argv.tName }, typeof argv.tDefault === 'string' && { default: argv.tDefault });
    return Object.assign({}, typeof argv.path === 'string' && { path: argv.path }, typeof argv.subdirName === 'string' && { subdirName: argv.subdirName }, typeof argv.fileName === 'string' && { fileName: argv.fileName }, argv.css !== undefined && { css: argv.css }, argv.scss !== undefined && { scss: argv.scss }, { colors: colorOptions }, { strokeWidths: strokeWidthOptions }, { transition: transitionOptions });
