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
(() => __awaiter(void 0, void 0, void 0, function* () {
    let opts;
    try {
        opts = getOptionsAsObject();
    }
    catch (err) {
        console.error(chalk_1.default.redBright(err));
        return;
    }
    yield chameleon.create(opts);
}))();
function getOptionsAsObject() {
    const args = yargs_1.default
        .boolean(['css', 'scss', 'cApply', 'cPreserve', 'swApply', 'swNonScaling', 'tApply']);
    const colors = Object.assign({}, args.argv.cApply !== undefined && { apply: args.argv.cApply }, typeof args.argv.cName === 'string' && { name: args.argv.cName }, args.argv.cPreserve !== undefined && { preserveOriginal: args.argv.cPreserve }, typeof args.argv.cCustomVars === 'string' && { customVars: getCustomVarsAsObject(args.argv.cCustomVars) });
    const strokeWidths = Object.assign({}, args.argv.swApply !== undefined && { apply: args.argv.swApply }, typeof args.argv.swName === 'string' && { name: args.argv.swName }, args.argv.swNonScaling !== undefined && { nonScaling: args.argv.swNonScaling }, typeof args.argv.swCustomVars === 'string' && { customVars: getCustomVarsAsObject(args.argv.swCustomVars) });
    const transition = Object.assign({}, args.argv.tApply !== undefined && { apply: args.argv.tApply }, typeof args.argv.tName === 'string' && { name: args.argv.tName }, typeof args.argv.tDefault === 'string' && { default: args.argv.tDefault });
    return Object.assign({}, typeof args.argv.path === 'string' && { path: args.argv.path }, typeof args.argv.subdirName === 'string' && { subdirName: args.argv.subdirName }, typeof args.argv.fileName === 'string' && { fileName: args.argv.fileName }, args.argv.css !== undefined && { css: args.argv.css }, args.argv.scss !== undefined && { scss: args.argv.scss }, { colors }, { strokeWidths }, { transition });
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