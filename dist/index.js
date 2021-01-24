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
exports.create = void 0;
const util_1 = require("./util");
const options_1 = require("./options");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
const svgo_1 = __importDefault(require("svgo"));
const svg_sprite_1 = __importDefault(require("svg-sprite"));
const svgson_1 = require("svgson");
let opts;
let fullPath;
let svgCount = 0;
let colorChangeCount = 0;
let strokeWidthChangeCount = 0;
let transitionApplyCount = 0;
exports.create = (customOptions = {}) => __awaiter(void 0, void 0, void 0, function* () {
    opts = applyCustomOptions(customOptions);
    fullPath = util_1.getAbsolutePath(opts.path);
    // Creating the basic sprite using svg-sprite
    console.log(chalk_1.default.grey(`Creating basic sprite inside '${path_1.join(fullPath, opts.subdirName)}' ...`));
    try {
        yield createRegularSprite();
        console.log(chalk_1.default.grey('Basic sprite created.'));
        // After creation, read sprite and inject it with variables
        // Orignal sprite is then overridden
        console.log(chalk_1.default.grey('-------------------------------'));
        console.log(chalk_1.default.hex('#FFBE5E')('Modifying ') +
            chalk_1.default.hex('#FFF25E')('the ') +
            chalk_1.default.hex('#A3FF5E')('sprite ') +
            chalk_1.default.hex('#5EFF8B')('to ') +
            chalk_1.default.hex('#5EF5FF')('become ') +
            chalk_1.default.hex('#6E8EFF')('an ') +
            chalk_1.default.hex('#AE5EFF')('adaptable ') +
            chalk_1.default.hex('#FF5EDB')('chameleon') +
            chalk_1.default.hex('#FF5E84')('...'));
        console.log(chalk_1.default.grey('-------------------------------'));
        yield createInjectedSprite();
        // Done!
        if (opts.colors.apply) {
            if (colorChangeCount > 0) {
                console.log(chalk_1.default.green(colorChangeCount) +
                    chalk_1.default.grey(' color var injections into attributes.'));
            }
            else {
                console.log(chalk_1.default.yellow(colorChangeCount) +
                    chalk_1.default.grey(' color vars were injected.'));
            }
        }
        if (opts.strokeWidths.apply) {
            if (strokeWidthChangeCount > 0) {
                console.log(chalk_1.default.green(strokeWidthChangeCount) +
                    chalk_1.default.grey(' stroke-width var injections into attributes.'));
            }
            else {
                console.log(chalk_1.default.yellow(strokeWidthChangeCount) +
                    chalk_1.default.grey(' stroke-width vars were injected.'));
            }
        }
        if (opts.transition.apply) {
            if (transitionApplyCount > 0) {
                console.log(chalk_1.default.green(transitionApplyCount) +
                    chalk_1.default.grey(' transition injections into tags.'));
            }
            else {
                console.log(chalk_1.default.yellow(transitionApplyCount) +
                    chalk_1.default.grey(' transitions were applied.'));
            }
        }
        cleanup();
        console.log(chalk_1.default.grey('-------------------------------'));
        console.log(chalk_1.default.green.bold('Task complete!'));
    }
    catch (err) {
        handleError(err);
    }
});
function createRegularSprite() {
    return __awaiter(this, void 0, void 0, function* () {
        const spriter = new svg_sprite_1.default({
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
        const svgoConvertStyles = new svgo_1.default({
            plugins: [{
                    inlineStyles: {
                        onlyMatchedOnce: false
                    },
                }]
        });
        // This SVGO configuration removes all style tags.
        const svgoRemoveStyles = new svgo_1.default({
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
                    const path = path_1.join(fullPath, item);
                    file = fs.readFileSync(path, { encoding: 'utf-8' });
                    if (!file) {
                        console.log(chalk_1.default.yellow(`Skipping ${item}, because the file is empty...`));
                        continue;
                    }
                    const styleConvertedFile = yield svgoConvertStyles.optimize(file, { path });
                    optimizedFile = yield svgoRemoveStyles.optimize(styleConvertedFile.data);
                    spriter.add(path_1.resolve(path), '', optimizedFile.data);
                    svgCount++;
                }
                catch (err) {
                    throw err;
                }
            }
        }
        if (svgCount) {
            console.log(chalk_1.default.green(svgs.length) + chalk_1.default.grey(' SVGs found.'));
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
                    fs.mkdirSync(path_1.dirname(result[mode][resource].path), { recursive: true });
                    fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
                }
            }
        });
    });
}
function createInjectedSprite() {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.join(fullPath, opts.subdirName, `${opts.fileName}.svg`);
        const jsonSprite = getSvgJson(filePath);
        console.log({ filePath, jsonSprite });
        // Unnecessary as far as i can tell
        //const spriteCopy = JSON.parse(JSON.stringify(jsonSprite));
        jsonSprite.children.forEach((symbol) => {
            modifyAttributes(symbol, new Map(), new Map());
        });
        fs.writeFileSync(`${fullPath}${opts.subdirName}/${opts.fileName}.svg`, svgson_1.stringify(jsonSprite));
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
        return svgson_1.parseSync(file.toString());
    }
    catch (err) {
        console.error(err);
    }
}
function applyCustomOptions(customOptions) {
    if (customOptions.transition && customOptions.transition.name || customOptions.transition && customOptions.transition.default) {
        customOptions.transition.apply = true;
    }
    return util_1.deepMerge(options_1.getDefaultOptions(), customOptions);
}
function handleError(err) {
    console.error(chalk_1.default.redBright(err));
}
function cleanup() {
    svgCount = 0;
    colorChangeCount = 0;
    strokeWidthChangeCount = 0;
    transitionApplyCount = 0;
}
//# sourceMappingURL=index.js.map