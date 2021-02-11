#! /usr/bin/env node
import { ChameleonOptions } from './lib/interfaces';
import * as chameleon  from './';
import chalk from 'chalk';
import yargs from 'yargs';
import  findUp from 'find-up';
import * as fs from 'fs';
import { setupOptions } from './options';
const configPath = findUp.sync(['chameleon.config.json', 'chameleon.config.js']);
// @ts-ignore
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};

const { argv } = yargs
    .option('css', {
        type: 'boolean',
        description: 'compile to css',
    })
    .option('scss', {
        type: 'boolean',
        description: 'compile to scss',
    })
    .option('path', {
        type: 'string',
        description: 'MISSING description',
    })
    .option('subdirName', {
        type: 'string',
        description: 'MISSING description',
    })
    .option('fileName', {
        type: 'string',
        description: 'MISSING description',
    })
    .option('colors.name', {
        alias: 'cName',
        type: 'string',
        description: 'MISSING description',
    })
    .option('colors.apply', {
        alias: 'cApply',
        type: 'boolean',
        description: 'MISSING description',
    })
    .option('colors.preserveOriginal', {
        alias: 'cPreserve',
        type: 'boolean',
        description: 'MISSING description',
    })
    .option('colors.customVars', {
        alias: 'cCustomVars',
        type: 'string',
        description: 'MISSING description',
    })
    .option('strokeWidths.name', {
        alias: 'swName',
        type: 'string',
        description: 'MISSING description',
    })
    .option('strokeWidths.apply', {
        alias: 'swApply',
        type: 'boolean',
        description: 'MISSING description',
    })
    .option('strokeWidths.nonScaling', {
        alias: 'swNonScaling',
        type: 'boolean',
        description: 'MISSING description',
    })
    .option('strokeWith.customVars', {
        alias: 'swCustomVars',
        type: 'string',
        description: 'MISSING description',
    })
    .option('transition.name', {
        alias: 'tName',
        type: 'string',
        description: 'MISSING description',
    })
    .option('transition.apply', {
        alias: 'tApply',
        type: 'boolean',
        description: 'MISSING description',
    })
    .option('transition.default', {
        alias: 'tDefault',
        type: 'string',
        description: 'MISSING description',
    })
    .parserConfiguration({
        "camel-case-expansion": false,
        "dot-notation": true,
        "strip-aliased": true,
    })
    .config(config)
    .config()
    .command<ChameleonOptions>(
        'create',
        'create a svg sprite',
        () => {},
        (argv: ChameleonOptions) => {
            init(argv);
        })
    .argv;

async function init(options: ChameleonOptions): Promise<void> {
    try {
        await chameleon.create(setupOptions(options));
    } catch(err) {
        console.error(chalk.redBright(err));
    }
}

export default argv;
