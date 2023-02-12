import { ColorOptions, StrokeWidthOptions, TransitionOptions } from './lib/interfaces/chameleon-options';
import { ChameleonOptions } from './lib/interfaces';
import { PlainObjectType } from './lib/types';
import { getAbsolutePath, deepMerge } from './util';
import { getDefaultOptions } from './options';

import * as fs from 'fs';
import { join, dirname, resolve } from 'path';
import chalk from 'chalk';
import sprite from 'svg-sprite';
import * as svgson from 'svgson';
import { INode } from 'svgson';
import { optimize } from 'svgo';

let svgCount: number = 0;
let colorChangeCount: number = 0;
let strokeWidthChangeCount: number = 0;
let transitionApplyCount: number = 0;

export const create = async (customOptions: Partial<ChameleonOptions> = {}): Promise<void> => {
  const opts = applyCustomOptions(customOptions);

  // Creating the basic sprite using svg-sprite
  console.log(chalk.grey(`Creating basic sprite inside '${opts.dest}' ...`));
  try {
    await createRegularSprite(opts);
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
    await createInjectedSprite(opts);
    // Done!
    if (opts.colors.apply) {
      if (colorChangeCount > 0) {
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
    if (opts.strokeWidths.apply) {
      if (strokeWidthChangeCount > 0) {
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
    if (opts.transition.apply) {
      if (transitionApplyCount > 0) {
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
  } catch (err) {
    handleError(err);
  }
}

async function createRegularSprite({ path, dest, name, dimensionStyles: { css, scss } }: ChameleonOptions): Promise<void> {
  const spriter = new sprite({
    dest,
    shape: {
      transform: [],
    },
    svg: {
      xmlDeclaration: false,
      doctypeDeclaration: false,
    },
    mode: {
      inline: true,
      symbol: {
        dest,
        sprite: `${name}.svg`,
        render: {
          css: css.create ? { dest: css.dest } : false,
          scss: scss.create ? { dest: scss.dest } : false,
        }
      }
    },
  });

  let svgs;
  // Add all SVGs to sprite
  try {
    svgs = fs.readdirSync(path);
  } catch (err) {
    throw err;
  }
  for (const item of svgs) {
    let file;
    let optimizedFile;

    if (item.endsWith('.svg')) {
      try {
        const svgPath = join(path, item);

        file = fs.readFileSync(svgPath, { encoding: 'utf-8' });
        if (!file) {
          console.log(chalk.yellow(`Skipping ${item}, because the file is empty...`));
          continue;
        }

        /*
        * Apperently, converting styles and removing style tag at the same time with SVGO doesn't seem to work.
        * Right now, I just optimize 2 times with different options.
        * Holzhammermethode! :D
        */

        //This SVGO configuration converts styles from a <style> tag to inline attributes
        const styleConvertedFile = optimize(file, { path: svgPath,
          
            plugins: [
              {
                name: 'inlineStyles',
                params: {
                  onlyMatchedOnce: false
                },
              },
              {
                name: 'removeUnknownsAndDefaults',
                params: {
                  defaultAttrs: false,
                }
              },
            ]
          });

        // This SVGO configuration removes all style tags.
        optimizedFile = optimize(styleConvertedFile.data, {
          plugins: ['removeStyleElement',
            {
              name: 'removeUnknownsAndDefaults',
              params: {
                defaultAttrs: false,
              }
            },
          ]
        });
        spriter.add(resolve(svgPath), '', optimizedFile.data);
        svgCount++;
      } catch (err) {
        throw err;
      }
    }
  }

  if (svgCount) {
    console.log(chalk.green(svgs.length) + chalk.grey(' SVGs found.'));
  } else {
    throw new Error(`No SVG files found in '${path}'. Make sure you are using the correct path.`)
  }
  // Compile the sprite
  spriter.compile((err: Error, result: Array<PlainObjectType>): void => {
    if (err) {
      throw err;
    }

    for (let mode in result) {
      for (let resource in result[mode]) {
        fs.mkdirSync(dirname(result[mode][resource].path), { recursive: true });
        fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
      }
    }
  });
}

async function createInjectedSprite(opts: ChameleonOptions): Promise<void> {
  const filePath = join(opts.dest, `${opts.name}.svg`)
  const jsonSprite = getSvgJson(filePath) as INode;

  jsonSprite.children.forEach((symbol: INode) => {
    modifyAttributes(symbol, opts);
  });

  fs.writeFileSync(filePath, svgson.stringify(jsonSprite));
}

function modifyAttributes(
  el: INode,
  opts: ChameleonOptions,
  registeredColors = new Map<string, string>(),
  registeredStrokeWidths = new Map<string, string>(),
) {
  const { colors, strokeWidths, transition } = opts;

  // TODO: Make Gradients work! (stop-color)
  if (el.attributes && el.name !== 'style') {
    if (colors.apply) {
      // FILL
      let fill = el.attributes.fill;

      if (fill && validValue(fill)) {
        if (registeredColors.get(fill)) {
          // If fill color has already an assigned variable
          el.attributes.fill = registeredColors.get(fill) || '';
        } else {
          // If fill is a new color (gets registered)
          let varFill = variablizeColor(fill, registeredColors.size + 1, colors);
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
        } else {
          // If color is a new color (gets registered)
          let varStroke = variablizeColor(stroke, registeredColors.size + 1, colors);
          registeredColors.set(stroke, varStroke);
          el.attributes.stroke = varStroke;
        }
        colorChangeCount++;
      }
    }
    // STROKE-WIDTH
    if (strokeWidths.apply) {
      let strokeWidth = el.attributes['stroke-width'];
      if (strokeWidth && validValue(strokeWidth)) {
        if (registeredStrokeWidths.get(strokeWidth)) {
          // If stroke-width has already an assigned variable
          el.attributes['stroke-width'] = registeredStrokeWidths.get(strokeWidth) || '';
        } else {
          // If stroke-width is a new stroke-width (gets registered)
          let varStrokeWidth = variablizeStrokeWidth(strokeWidth, registeredStrokeWidths.size + 1, strokeWidths);
          registeredStrokeWidths.set(strokeWidth, varStrokeWidth);
          el.attributes['stroke-width'] = varStrokeWidth;
        }
        strokeWidthChangeCount++;
      }
    }
    // NON SCALING STROKE-WIDTH
    if (strokeWidths.nonScaling && el.attributes['stroke-width']) {
      let vectorEffect = el.attributes['vector-effect'];
      if (vectorEffect && !vectorEffect.includes('non-scaling-stroke')) {
        el.attributes['vector-effect'] = vectorEffect + ' non-scaling-stroke';
      } else if (!vectorEffect) {
        el.attributes['vector-effect'] = 'non-scaling-stroke';
      }
    }

    // TRANSITION
    if (transition.apply) {
      // only apply transition to elements that actually need it
      if (el.attributes.fill || el.attributes.stroke || el.attributes['stroke-width']) {
        el.attributes.style = variablizeTransitionStyle(el.attributes.style, transition);
        transitionApplyCount++;
      }
    }
  }
  // RECURSIVE FOR ALL CHILDREN
  if (el.children.length) {
    el.children.forEach((child: INode) => {
      modifyAttributes(child, opts, registeredColors, registeredStrokeWidths);
    });
  }
}

function variablizeColor(p_color: string, id: number, { name, customVars, preserveOriginal }: ColorOptions): string {
  const varStr = id === 1 ? `--${name}` : `--${name}-${id}`;
  const color = preserveOriginal ? p_color : 'currentColor';
  if (customVars && customVars[p_color]) {
    return `var(${varStr}, var(--${customVars[p_color]}, ${color}))`
  }
  return `var(${varStr}, ${color})`;
}

function variablizeStrokeWidth(strokeWidth: string, id: number, { name, customVars }: StrokeWidthOptions): string {
  const varStr = id === 1 ? `--${name}` : `--${name}-${id}`;
  if (customVars && customVars[strokeWidth]) {
    return `var(${varStr}, var(--${customVars[strokeWidth]}, ${strokeWidth}))`
  }
  return `var(${varStr}, ${strokeWidth})`;
}

function variablizeTransitionStyle(style: string, options: TransitionOptions): string {

  const varStr = `--${options.name}`;
  const completeStr = options.default ? `var(${varStr}, ${options.default})` : `var(${varStr})`;
  return style ? `${style} transition: ${completeStr};` : `transition: ${completeStr};`;
}

function validValue(str: string): boolean {
  // not already var(
  // not url() (used in gradients with defs - gradients don't really work atm anyway)
  // not none
  return !str.includes('var(') && !str.includes('url(') && !str.includes('none');
}

function getSvgJson(path: string): INode | void {
  try {
    const file = fs.readFileSync(path);

    return svgson.parseSync(file.toString());
  } catch (err) {
    console.error(err);
  }
}

function applyCustomOptions(customOptions: Partial<ChameleonOptions>): ChameleonOptions {
  if (customOptions.transition && customOptions.transition.name || customOptions.transition && customOptions.transition.default) {
    customOptions.transition.apply = true;
  }

  if (customOptions.dimensionStyles) {
    const css = customOptions.dimensionStyles.css;
    const scss = customOptions.dimensionStyles.scss;
    customOptions.dimensionStyles.css.create = css.create === true || css.name !== undefined || css.dest !== undefined;
    customOptions.dimensionStyles.scss.create = scss.create === true || scss.name !== undefined || scss.dest !== undefined;
  }

  const options = deepMerge<ChameleonOptions>(getDefaultOptions(), customOptions);

  options.path = getAbsolutePath(options.path);
  options.dest = options.dest ? getAbsolutePath(options.dest) : join(options.path, options.name);


  const css = options.dimensionStyles.css
  const cssName = `${css.name || options.name}.css`;
  const cssPath = getAbsolutePath(css.dest || options.dest);

  const scss = options.dimensionStyles.scss
  const scssName = `${scss.name || options.name}.scss`;
  const scssPath = getAbsolutePath(scss.dest || options.dest);

  css.dest = join(cssPath, cssName);
  scss.dest = join(scssPath, scssName);

  return options;
}

function handleError(err: unknown): void {
  console.error(chalk.redBright(err));
}

function cleanup(): void {
  svgCount = 0;
  colorChangeCount = 0;
  strokeWidthChangeCount = 0;
  transitionApplyCount = 0;
}
