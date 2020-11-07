var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import svgson from 'svgson';
import SVGO from 'svgo';
import sprite from 'svg-sprite';
let fullPath = process.cwd() + '/';
const opts = {
    path: '',
    subdirName: 'chameleon-sprite',
    fileName: 'chameleon-sprite',
    css: false,
    scss: false,
    colors: {
        apply: true,
        name: 'svg-custom-color',
        preserveOriginal: true,
    },
    strokeWidths: {
        apply: true,
        name: 'svg-custom-stroke-width',
        nonScaling: false,
    },
    transition: {
        apply: false,
        name: 'svg-custom-transition',
        default: null,
    },
};
let svgCount = 0;
let colorChangeCount = 0;
let strokeWidthChangeCount = 0;
let transitionApplyCount = 0;
export const create = (customOptions) => __awaiter(void 0, void 0, void 0, function* () {
    if (customOptions) {
        applyCustomOptions(customOptions);
        updateFullPath();
    }
    // Creating the basic sprite using svg-sprite
    console.log(chalk.grey(`Creating basic sprite inside '${fullPath}${opts.subdirName}/' ...`));
    try {
        yield createRegularSprite();
        console.log(chalk.grey('Basic sprite created.'));
        // After creation, read sprite and inject it with variables
        // Orignal sprite is then overridden
        console.log(chalk.grey('-------------------------------'));
        console.log(chalk.hex('#FFBE5E')('Modifying ') +
            chalk.hex('#FFF25E')('the ') +
            chalk.hex('#A3FF5E')('sprite ') +
            chalk.hex('#5EFF8B')('to ') +
            chalk.hex('#5EF5FF')('become ') +
            chalk.hex('#6E8EFF')('an ') +
            chalk.hex('#AE5EFF')('adaptable ') +
            chalk.hex('#FF5EDB')('chameleon') +
            chalk.hex('#FF5E84')('...'));
        console.log(chalk.grey('-------------------------------'));
        yield createInjectedSprite();
        // Done!
        if (opts.colors.apply) {
            if (colorChangeCount > 0) {
                console.log(chalk.green(colorChangeCount) +
                    chalk.grey(' color var injections into attributes.'));
            }
            else {
                console.log(chalk.yellow(colorChangeCount) +
                    chalk.grey(' color vars were injected.'));
            }
        }
        if (opts.strokeWidths.apply) {
            if (strokeWidthChangeCount > 0) {
                console.log(chalk.green(strokeWidthChangeCount) +
                    chalk.grey(' stroke-width var injections into attributes.'));
            }
            else {
                console.log(chalk.yellow(strokeWidthChangeCount) +
                    chalk.grey(' stroke-width vars were injected.'));
            }
        }
        if (opts.transition.apply) {
            if (transitionApplyCount > 0) {
                console.log(chalk.green(transitionApplyCount) +
                    chalk.grey(' transition injections into tags.'));
            }
            else {
                console.log(chalk.yellow(transitionApplyCount) +
                    chalk.grey(' transitions were applied.'));
            }
        }
        cleanup();
        console.log(chalk.grey('-------------------------------'));
        console.log(chalk.green.bold('Task complete!'));
    }
    catch (err) {
        handleError(err);
    }
});
function createRegularSprite() {
    return __awaiter(this, void 0, void 0, function* () {
        const spriter = new sprite({
            dest: fullPath,
            svg: {
                xmlDeclaration: false,
                doctypeDeclaration: false,
            },
            mode: {
                inline: true,
                symbol: {
                    dest: opts.subdirName,
                    sprite: opts.fileName + '.svg',
                    render: {
                        css: opts.css ? { dest: opts.fileName + '.css' } : false,
                        scss: opts.scss ? { dest: opts.fileName + '.scss' } : false,
                    }
                }
            },
        });
        /* Apperently, converting styles and removing style tag at the same time with SVGO doesn't seem to work.
         * Right now, I just optimize 2 times with different options.
         * Holzhammermethode! :D
         */
        //This SVGO configuration converts styles from a <style> tag to inline attributes
        const svgoConvertStyles = new SVGO({
            plugins: [{
                    inlineStyles: {
                        onlyMatchedOnce: false
                    },
                }]
        });
        // This SVGO configuration removes all style tags.
        const svgoRemoveStyles = new SVGO({
            plugins: [{
                    removeStyleElement: true,
                }]
        });
        let svgs;
        // Add all SVGs to sprite
        try {
            svgs = fs.readdirSync(fullPath);
        }
        catch (err) {
            throw err;
        }
        for (const item of svgs) {
            let file;
            let optimizedFile;
            if (item.endsWith('.svg')) {
                try {
                    file = fs.readFileSync(fullPath + item, { encoding: 'utf-8' });
                    if (!file) {
                        console.log(chalk.yellow(`Skipping ${item}, because the file is empty...`));
                        continue;
                    }
                    const styleConvertedFile = yield svgoConvertStyles.optimize(file, { path: fullPath + item });
                    optimizedFile = yield svgoRemoveStyles.optimize(styleConvertedFile.data);
                    spriter.add(path.resolve(fullPath + item), '', optimizedFile.data);
                    svgCount++;
                }
                catch (err) {
                    throw err;
                }
            }
        }
        if (svgCount) {
            console.log(chalk.green(svgs.length) + chalk.grey(' SVGs found.'));
        }
        else {
            throw new Error(`No SVG files found in '${fullPath}'. Make sure you are using the correct path.`);
        }
        // Compile the sprite
        spriter.compile(function (err, result) {
            if (err) {
                throw err;
            }
            // @Todo(Chris): check if this is ever used
            // this has no effect as far as i can see
            for (let mode in result) {
                for (let resource in result[mode]) {
                    fs.mkdirSync(path.dirname(result[mode][resource].path), { recursive: true });
                    fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
                }
            }
        });
    });
}
function createInjectedSprite() {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonSprite = getSvgJson(`${fullPath}${opts.subdirName}/${opts.fileName}.svg`);
        // Unnecessary as far as i can tell
        // const spriteCopy = JSON.parse(JSON.stringify(jsonSprite));
        jsonSprite.children.forEach((symbol) => {
            modifyAttributes(symbol, new Map(), new Map());
        });
        fs.writeFileSync(`${fullPath}${opts.subdirName}/${opts.fileName}.svg`, svgson.stringify(jsonSprite));
    });
}
function modifyAttributes(el, registeredColors, registeredStrokeWidths) {
    // TODO: Make Gradients work! (stop-color)
    if (el.attributes && el.name !== 'style') {
        if (opts.colors.apply) {
            // FILL
            let fill = el.attributes.fill;
            if (fill && validValue(fill)) {
                if (registeredColors.get(fill)) {
                    // If fill color has already an assigned variable
                    el.attributes.fill = registeredColors.get(fill) || '';
                }
                else {
                    // If fill is a new color (gets registered)
                    let varFill = variablizeColor(fill, registeredColors.size + 1);
                    registeredColors.set(fill, varFill);
                    el.attributes.fill = varFill;
                }
                colorChangeCount++;
            }
            // STROKE
            let stroke = el.attributes.stroke;
            if (stroke && validValue(stroke)) {
                if (registeredColors.get(stroke)) {
                    // If stroke has already an assigned variable
                    el.attributes.stroke = registeredColors.get(stroke) || '';
                }
                else {
                    // If color is a new color (gets registered)
                    let varStroke = variablizeColor(stroke, registeredColors.size + 1);
                    registeredColors.set(stroke, varStroke);
                    el.attributes.stroke = varStroke;
                }
                colorChangeCount++;
            }
        }
        // STROKE-WIDTH
        if (opts.strokeWidths.apply) {
            let strokeWidth = el.attributes['stroke-width'];
            if (strokeWidth && validValue(strokeWidth)) {
                if (registeredStrokeWidths.get(strokeWidth)) {
                    // If stroke-width has already an assigned variable
                    el.attributes['stroke-width'] = registeredStrokeWidths.get(strokeWidth) || '';
                }
                else {
                    // If stroke-width is a new stroke-width (gets registered)
                    let varStrokeWidth = variablizeStrokeWidth(strokeWidth, registeredStrokeWidths.size + 1);
                    registeredStrokeWidths.set(strokeWidth, varStrokeWidth);
                    el.attributes['stroke-width'] = varStrokeWidth;
                }
                strokeWidthChangeCount++;
            }
        }
        // NON SCALING STROKE-WIDTH
        if (opts.strokeWidths.nonScaling && el.attributes['stroke-width']) {
            let vectorEffect = el.attributes['vector-effect'];
            if (vectorEffect && !vectorEffect.includes('non-scaling-stroke')) {
                el.attributes['vector-effect'] = vectorEffect + ' non-scaling-stroke';
            }
            else if (!vectorEffect) {
                el.attributes['vector-effect'] = 'non-scaling-stroke';
            }
        }
        // TRANSITION
        if (opts.transition.apply) {
            // only apply transition to elements that actually need it
            if (el.attributes.fill || el.attributes.stroke || el.attributes['stroke-width']) {
                el.attributes.style = variablizeTransitionStyle(el.attributes.style);
                transitionApplyCount++;
            }
        }
    }
    // RECURSIVE FOR ALL CHILDREN
    if (el.children.length) {
        el.children.forEach((child) => {
            modifyAttributes(child, registeredColors, registeredStrokeWidths);
        });
    }
}
function variablizeColor(p_color, id) {
    const varStr = id === 1 ? `--${opts.colors.name}` : `--${opts.colors.name}-${id}`;
    const color = opts.colors.preserveOriginal ? p_color : 'currentColor';
    if (opts.colors.customVars && opts.colors.customVars[p_color]) {
        return `var(--${opts.colors.customVars[p_color]}, var(${varStr}, ${color}))`;
    }
    return `var(${varStr}, ${color})`;
}
function variablizeStrokeWidth(strokeWidth, id) {
    const varStr = id === 1 ? `--${opts.strokeWidths.name}` : `--${opts.strokeWidths.name}-${id}`;
    if (opts.strokeWidths.customVars && opts.strokeWidths.customVars[strokeWidth]) {
        return `var(--${opts.strokeWidths.customVars[strokeWidth]}, var(${varStr}, ${strokeWidth}))`;
    }
    return `var(${varStr}, ${strokeWidth})`;
}
function variablizeTransitionStyle(style) {
    const varStr = `--${opts.transition.name}`;
    const completeStr = opts.transition.default ? `var(${varStr}, ${opts.transition.default})` : `var(${varStr})`;
    return style ? `${style} transition: ${completeStr};` : `transition: ${completeStr};`;
}
function validValue(str) {
    // not already var(
    // not url() (used in gradients with defs - gradients don't really work atm anyway)
    // not none
    return !str.includes('var(') && !str.includes('url(') && !str.includes('none');
}
function getSvgJson(path) {
    try {
        const file = fs.readFileSync(path);
        return svgson.parseSync(file.toString());
    }
    catch (err) {
        console.error(err);
    }
}
function getFolderPath(path) {
    return !path || path.endsWith('/') ? path : path + '/';
}
function updateFullPath() {
    fullPath = process.cwd() + '/' + opts.path;
}
function applyCustomOptions(customOptions) {
    if (customOptions.transition && customOptions.transition.name || customOptions.transition && customOptions.transition.default) {
        opts.transition.apply = true;
    }
    merge(opts, customOptions);
    opts.path = getFolderPath(opts.path);
}
// Merge a `source` object to a `target` recursively
function merge(target, source) {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key], source[key]));
    }
    // Join `target` and modified `source`
    Object.assign(target || {}, source);
    return target;
}
function handleError(err) {
    console.error(chalk.redBright(err));
    return;
}
function cleanup() {
    svgCount = 0;
    colorChangeCount = 0;
    strokeWidthChangeCount = 0;
    transitionApplyCount = 0;
}
//# sourceMappingURL=index.js.map