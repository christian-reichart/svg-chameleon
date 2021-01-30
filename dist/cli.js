#! /usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chameleon = __importStar(require("./"));
const chalk_1 = __importDefault(require("chalk"));
const yargs_1 = __importDefault(require("yargs"));
const options_1 = require("./options");
const util_1 = require("./util");
const { argv } = yargs_1.default
    .boolean(['css', 'scss', 'cApply', 'cPreserve', 'swApply', 'swNonScaling', 'tApply'])
    .string(['config', 'path', 'subdirName', 'fileName', 'cName', 'cCustomVars', 'swName', 'swCustomVars', 'tName', 'tDefault']);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configOptions = yield options_1.getOptionsFromConfigFile(argv.config);
        const cliOptions = getOptionsAsObject();
        const options = util_1.deepMerge(configOptions, cliOptions);
        yield chameleon.create(options);
    }
    catch (err) {
        console.error(chalk_1.default.redBright(err));
    }
}))();
function getOptionsAsObject() {
    const colors = Object.assign({}, argv.cApply !== undefined && { apply: argv.cApply }, typeof argv.cName === 'string' && { name: argv.cName }, argv.cPreserve !== undefined && { preserveOriginal: argv.cPreserve }, typeof argv.cCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.cCustomVars) });
    const strokeWidths = Object.assign({}, argv.swApply !== undefined && { apply: argv.swApply }, typeof argv.swName === 'string' && { name: argv.swName }, argv.swNonScaling !== undefined && { nonScaling: argv.swNonScaling }, typeof argv.swCustomVars === 'string' && { customVars: getCustomVarsAsObject(argv.swCustomVars) });
    const transition = Object.assign({}, argv.tApply !== undefined && { apply: argv.tApply }, typeof argv.tName === 'string' && { name: argv.tName }, typeof argv.tDefault === 'string' && { default: argv.tDefault });
    return Object.assign({}, typeof argv.path === 'string' && { path: argv.path }, typeof argv.subdirName === 'string' && { subdirName: argv.subdirName }, typeof argv.fileName === 'string' && { fileName: argv.fileName }, argv.css !== undefined && { css: argv.css }, argv.scss !== undefined && { scss: argv.scss }, { colors }, { strokeWidths }, { transition });
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