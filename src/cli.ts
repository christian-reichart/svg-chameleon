#! /usr/bin/env node
import { ChameleonOptions } from './lib/interfaces';
import * as chameleon from './';
import chalk from 'chalk';
import yargs from 'yargs';
import  findUp from 'find-up';
import * as fs from 'fs';
import { setupOptions } from './options';
const configPath = findUp.sync(['chameleon.config.json', 'chameleon.config.js']);

const config = configPath ? JSON.parse(fs.readFileSync(configPath).toString()) : {};

// @Todo(phil): missing dest / config options

const { argv } = yargs
    .option('dimensionStyles.css.create', {
        type: 'boolean',
        default: false,
        alias: 'css',
        description: 'creates css with classes for dimensions / automatically true if other option is set',
    })
    .option('dimensionStyles.css.name', {
        type: 'string',
        default: null,
        alias: 'css-name',
        description: 'default: name',
    })
    .option('dimensionStyles.css.dest', {
        type: 'string',
        default: null,
        alias: 'css-dest',
        description: 'default: same dir as sprite',
    })
    .option('dimensionStyles.scss.create', {
        type: 'boolean',
        default: false,
        alias: 'scss',
        description: 'creates scss with classes for dimensions / automatically true if other option is set',
    })
    .option('dimensionStyles.scss.name', {
        type: 'string',
        default: null,
        alias: 'scss-name',
        description: 'default: name',
    })
    .option('dimensionStyles.scss.dest', {
        type: 'string',
        default: null,
        alias: 'scss-dest',
        description: 'default: same dir as sprite',
    })
    .option('path', {
        type: 'string',
        default: __dirname,
        description: "default: '' (current working directory)",
    })
    .option('dest', {
        type: 'string',
        default: __dirname,
        description: "default: path + name as subfolder, if dest is specified no additional subfolder is created",
    })
    .option('name', {
        type: 'string',
        default: 'chameleon-sprite',
        description: "used for .svg, .scss and .css files",
    })
    .option('colors.name', {
        alias: 'c-name',
        type: 'string',
        default: 'svg-custom-color',
        description: "additional colors are named 'svg-custom-color-2' and so on",
    })
    .option('colors.apply', {
        alias: 'c-apply',
        type: 'boolean',
        default: true,
        description: 'default: true',
    })
    .option('colors.preserveOriginal', {
        alias: 'c-preserve',
        type: 'boolean',
        default: true,
        description: "if false, replaces original color with 'currentColor'",
    })
    .option('colors.customVars', {
        alias: 'c-custom-vars',
        type: 'string',
        description: "this would result in --color-grey for every color attribute with '#D8D8D8' (--svg-custom-color will still override this)",
    })
    .option('strokeWidths.name', {
        alias: 'sw-name',
        type: 'string',
        default: 'svg-custom-stroke-width',
        description: "additional stroke-widths are named 'svg-custom-stroke-width-2' and so on",
    })
    .option('strokeWidths.apply', {
        alias: 'sw-apply',
        type: 'boolean',
        default: true,
        description: 'default: true',
    })
    .option('strokeWidths.nonScaling', {
        alias: 'sw-non-scaling',
        type: 'boolean',
        default: true,
        description: "if true, preserves the stroke-width when scaling the SVG",
    })
    .option('strokeWith.customVars', {
        alias: 'sw-custom-vars',
        type: 'string',
        description: "this would result in --stroke-thin for every stroke-width with '1' (--svg-custom-stroke-width will still override this)",
    })
    .option('transition.name', {
        alias: 't-name',
        type: 'string',
        default: 'svg-custom-transition',
        description: "",
    })
    .option('transition.apply', {
        alias: 't-apply',
        type: 'boolean',
        default: false,
        description: '(automatically true if one of the other transition options is given)',
    })
    .option('transition.default', {
        alias: 't-default',
        type: 'string',
        description: 'fallback, if no transition variable is assigned in your CSS',
    })
    .parserConfiguration({
        "camel-case-expansion": false,
        "dot-notation": true,
        "strip-aliased": true,
    })
    .config(config)
    .config()
    .command<ChameleonOptions>(
        ['create', 'g'],
        'create a svg sprite',
        () => {},
        async (argv: ChameleonOptions) => {
            await init(argv);
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
