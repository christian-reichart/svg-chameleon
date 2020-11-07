import { ChameleonOptions, TransitionOptions } from './lib/interfaces';
import { PlainObjectType } from './lib/types';

import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as svgson from 'svgson';
import SVGO from 'svgo';
import sprite from 'svg-sprite';

let fullPath = process.cwd() + '/';

const opts: ChameleonOptions = {
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

export const create = async (customOptions: ChameleonOptions): Promise<void> => {
  if(customOptions) {
    applyCustomOptions(customOptions);
    updateFullPath();
  }
  // Creating the basic sprite using svg-sprite
  console.log(chalk.grey(`Creating basic sprite inside '${fullPath}${opts.subdirName}/' ...`));
  try {
    await createRegularSprite();
    console.log(chalk.grey('Basic sprite created.'));
    // After creation, read sprite and inject it with variables
    // Orignal sprite is then overridden
    console.log(chalk.grey('-------------------------------'));
    console.log(
      chalk.hex('#FFBE5E')('Modifying ') +
      chalk.hex('#FFF25E')('the ') +
      chalk.hex('#A3FF5E')('sprite ') +
      chalk.hex('#5EFF8B')('to ') +
      chalk.hex('#5EF5FF')('become ') +
      chalk.hex('#6E8EFF')('an ') +
      chalk.hex('#AE5EFF')('adaptable ') +
      chalk.hex('#FF5EDB')('chameleon') +
      chalk.hex('#FF5E84')('...'));
    console.log(chalk.grey('-------------------------------'));
    await createInjectedSprite();
    // Done!
    if(opts.colors.apply) {
      if(colorChangeCount > 0) {
        console.log(
          chalk.green(colorChangeCount) +
          chalk.grey(' color var injections into attributes.')
        );
      } else {
        console.log(
          chalk.yellow(colorChangeCount) +
          chalk.grey(' color vars were injected.')
        );
      }
    }
    if(opts.strokeWidths.apply) {
      if(strokeWidthChangeCount > 0) {
        console.log(
          chalk.green(strokeWidthChangeCount) +
          chalk.grey(' stroke-width var injections into attributes.')
        );
        } else {
          console.log(
            chalk.yellow(strokeWidthChangeCount) +
            chalk.grey(' stroke-width vars were injected.')
          );
      }
    }
    if(opts.transition.apply) {
      if(transitionApplyCount > 0) {
        console.log(
          chalk.green(transitionApplyCount) +
          chalk.grey(' transition injections into tags.')
        );
      } else {
        console.log(
          chalk.yellow(transitionApplyCount) +
          chalk.grey(' transitions were applied.')
        );
      }
    }
    cleanup();
    console.log(chalk.grey('-------------------------------'));
    console.log(chalk.green.bold('Task complete!'));
  } catch(err) {
    handleError(err);
  }
}

async function createRegularSprite(): Promise<void> {
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
  } catch(err) {
    throw err;
  }
  for(const item of svgs) {
    let file;
    let optimizedFile;
    if(item.endsWith('.svg')) {
      try {
        file = fs.readFileSync(fullPath + item, { encoding: 'utf-8' });
        if (!file) {
          console.log(chalk.yellow(`Skipping ${item}, because the file is empty...`));
          continue;
        }
        const styleConvertedFile = await svgoConvertStyles.optimize(file, {path: fullPath + item});
        optimizedFile = await svgoRemoveStyles.optimize(styleConvertedFile.data);
        spriter.add(path.resolve(fullPath + item), '', optimizedFile.data);
        svgCount++;
      } catch (err) {
        throw err;
      }
    }
  }

  if(svgCount) {
    console.log(chalk.green(svgs.length) + chalk.grey(' SVGs found.'));
  } else {
    throw new Error(`No SVG files found in '${fullPath}'. Make sure you are using the correct path.`)
  }
  // Compile the sprite
  spriter.compile(function(err: Error, result: Array<PlainObjectType>): void {
    if(err) {
      throw err;
    }

    console.log('RESULT: ', result);

    for (let mode in result) {
        for (let resource in result[mode]) {
            fs.mkdirSync(path.dirname(result[mode][resource].path), { recursive: true });
            fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
        }
    }
  });
}

async function createInjectedSprite(): Promise<void> {
  const jsonSprite = getSvgJson(`${fullPath}${opts.subdirName}/${opts.fileName}.svg`);
  const spriteCopy = JSON.parse(JSON.stringify(jsonSprite));
  spriteCopy.children.forEach((symbol: any) => {
    modifyAttributes(symbol, new Map(), new Map());
  });
  fs.writeFileSync(`${fullPath}${opts.subdirName}/${opts.fileName}.svg`, svgson.stringify(spriteCopy));
}

function modifyAttributes(el: any, registeredColors: Map<string, string>, registeredStrokeWidths: Map<string, string>) {
  // TODO: Make Gradients work! (stop-color)
  if(el.attributes && el.name !== 'style'){
    if(opts.colors.apply){
      // FILL
      let fill = el.attributes.fill;
      if(fill && validValue(fill)) {
        if(registeredColors.get(fill)) {
          // If fill color has already an assigned variable
          el.attributes.fill = registeredColors.get(fill);
        } else {
          // If fill is a new color (gets registered)
          let varFill = variablizeColor(fill, registeredColors.size + 1);
          registeredColors.set(fill, varFill);
          el.attributes.fill = varFill;
        }
        colorChangeCount++;
      }
      // STROKE
      let stroke = el.attributes.stroke;
      if(stroke && validValue(stroke)) {
        if(registeredColors.get(stroke)) {
          // If stroke has already an assigned variable
          el.attributes.stroke = registeredColors.get(stroke);
        } else {
          // If color is a new color (gets registered)
          let varStroke = variablizeColor(stroke, registeredColors.size + 1);
          registeredColors.set(stroke, varStroke);
          el.attributes.stroke = varStroke;
        }
        colorChangeCount++;
      }
    }
    // STROKE-WIDTH
    if(opts.strokeWidths.apply) {
      let strokeWidth = el.attributes['stroke-width'];
      if(strokeWidth && validValue(strokeWidth)) {
        if(registeredStrokeWidths.get(strokeWidth)) {
          // If stroke-width has already an assigned variable
          el.attributes['stroke-width'] = registeredStrokeWidths.get(strokeWidth);
        } else {
          // If stroke-width is a new stroke-width (gets registered)
          let varStrokeWidth = variablizeStrokeWidth(strokeWidth, registeredStrokeWidths.size + 1);
          registeredStrokeWidths.set(strokeWidth, varStrokeWidth);
          el.attributes['stroke-width'] = varStrokeWidth;
        }
        strokeWidthChangeCount++;
      }
    }
    // NON SCALING STROKE-WIDTH
    if(opts.strokeWidths.nonScaling && el.attributes['stroke-width']) {
      let vectorEffect = el.attributes['vector-effect'];
      if(vectorEffect && !vectorEffect.includes('non-scaling-stroke')) {
        el.attributes['vector-effect'] = vectorEffect + ' non-scaling-stroke';
      } else if(!vectorEffect) {
        el.attributes['vector-effect'] = 'non-scaling-stroke';
      }
    }

    // TRANSITION
    if(opts.transition.apply) {
      // only apply transition to elements that actually need it
      if(el.attributes.fill || el.attributes.stroke || el.attributes['stroke-width']) {
        const style = variablizeTransitionStyle(el.attributes.style);
        el.attributes.style = style;
        transitionApplyCount++;
      }
    }
  }
  // RECURSIVE FOR ALL CHILDREN
  if(el.children.length) {
    el.children.forEach((child: HTMLOrSVGElement) => {
      modifyAttributes(child, registeredColors, registeredStrokeWidths);
    });
  }
}

function variablizeColor(p_color: string, id: number): string {
  const varStr = id === 1 ? `--${opts.colors.name}` : `--${opts.colors.name}-${id}`;
  const color = opts.colors.preserveOriginal ? p_color : 'currentColor';
  if(opts.colors.customVars && opts.colors.customVars[p_color]) {
    return `var(--${opts.colors.customVars[p_color]}, var(${varStr}, ${color}))`
  }
  return `var(${varStr}, ${color})`;
}

function variablizeStrokeWidth(strokeWidth: string, id: number): string {
  const varStr = id === 1 ? `--${opts.strokeWidths.name}` : `--${opts.strokeWidths.name}-${id}`;
  if(opts.strokeWidths.customVars && opts.strokeWidths.customVars[strokeWidth]) {
    return `var(--${opts.strokeWidths.customVars[strokeWidth]}, var(${varStr}, ${strokeWidth}))`
  }
  return `var(${varStr}, ${strokeWidth})`;
}

function variablizeTransitionStyle(style: TransitionOptions) {
  const varStr = `--${opts.transition.name}`;
  const completeStr = opts.transition.default ? `var(${varStr}, ${opts.transition.default})` : `var(${varStr})`;
  return style ? `${style} transition: ${completeStr};` : `transition: ${completeStr};`;
}

function validValue(str: string): boolean {
  // not already var(
  // not url() (used in gradients with defs - gradients don't really work atm anyway)
  // not none
  return !str.includes('var(') && !str.includes('url(') && !str.includes('none');
}

function getSvgJson(path: string): PlainObjectType | undefined {
  try {
    const file = fs.readFileSync(path);
    return svgson.parseSync(file.toString());
  } catch (err) {
    console.error(err);
  }
}

function getFolderPath(path: string): string {
  return !path || path.endsWith('/') ? path : path +'/';
}

function updateFullPath(): void {
  fullPath = process.cwd() + '/' + opts.path;
}

function applyCustomOptions(customOptions: ChameleonOptions): void {
  if(customOptions.transition && customOptions.transition.name || customOptions.transition && customOptions.transition.default) {
    opts.transition.apply = true;
  }
  merge(opts, customOptions);
  opts.path = getFolderPath(opts.path);
}

// Merge a `source` object to a `target` recursively
function merge (target: PlainObjectType, source: PlainObjectType): PlainObjectType {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
  }
  // Join `target` and modified `source`
  Object.assign(target || {}, source)
  return target
}

function handleError(err: Error): void {
  console.error(chalk.redBright(err));
  return;
}

function cleanup(): void {
  svgCount = 0;
  colorChangeCount = 0;
  strokeWidthChangeCount = 0;
  transitionApplyCount = 0;
}
