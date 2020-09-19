#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const svgson = require('svgson');
const SVGO = require('svgo');
const SVGSpriter = require ('svg-sprite');

// TODO: Add yargs for CLI arguments
const ARGS = process.argv.slice(2);
const SVG_FOLDER = getFolderPath(ARGS[0]);
const SVG_SPRITE_SUBFOLDER = 'chameleon-sprite';
const SVG_SPRITE_NAME = 'chameleon-sprite.svg';
const SPRITER_CONFIG = {
  dest: SVG_FOLDER,
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
  },
  mode: {
    inline: true,
    symbol: {
      dest: SVG_SPRITE_SUBFOLDER,
      sprite: SVG_SPRITE_NAME,
    }
  },
};
const CHAMELEON_CONFIG = {
  colors: {
    modifiable: true,
    naming: 'svg-custom-color',
    preserveOriginal: true,
  },
  strokeWidths: {
    modifiable: true,
    naming: 'svg-custom-stroke-width',
    nonScaling: true,
  }
};
// This SVGO configuration converts styles from a <style> tag to inline attributes
const SVGO_CONFIG = {
  plugins: [{
    inlineStyles: {
      onlyMatchedOnce: false
    }
  }]
}
const spriter = new SVGSpriter(SPRITER_CONFIG);
const svgo = new SVGO(SVGO_CONFIG);

(async () => {
  await create();
})();

module.exports.create = create;

async function create() {
  // Creating the basic sprite using svg-sprite
  console.log(chalk.grey(`Creating basic sprite inside ${SVG_FOLDER}${SVG_SPRITE_SUBFOLDER}/...`));
  await createRegularSprite().catch(handleError);
  // After creation, read sprite and inject it with variables
  // Orignal sprite is then overridden
  console.log(chalk.grey('-------------------------------'));
  console.log(
    chalk.hex('#FFBE5E')('Modifing ') +
    chalk.hex('#FFF25E')('the ') +
    chalk.hex('#A3FF5E')('sprite ') +
    chalk.hex('#5EFF8B')('to ') +
    chalk.hex('#5EF5FF')('become ') +
    chalk.hex('#6E8EFF')('an ') +
    chalk.hex('#AE5EFF')('adaptable ') +
    chalk.hex('#FF5EDB')('chameleon') +
    chalk.hex('#FF5E84')('...'));
  await createInjectedSprite().catch(handleError);
  // Done!
  console.log(chalk.grey('-------------------------------'));
  console.log(chalk.green('Task complete!'));
}

async function createRegularSprite() {
  let svgs;
  // Add all SVGs to sprite
  try {
    svgs = fs.readdirSync(SVG_FOLDER);
  } catch(err) {
    throw err;
  }
  for(const item of svgs) {
    let file;
    let optimizedFile;
    if(item.endsWith('.svg')) {
      try {
        file = fs.readFileSync(SVG_FOLDER + item, { encoding: 'utf-8' });
        optimizedFile = await svgo.optimize(file, {path: SVG_FOLDER + item});
        spriter.add(path.resolve(SVG_FOLDER + item), null, optimizedFile.data);
      } catch (err) {
        throw err;
      }
    }
  };
  // Compile the sprite
  spriter.compile(function(err, result) {
    if(err) {
      throw err;
    }
    for (var mode in result) {
        for (var resource in result[mode]) {
            fs.mkdirSync(path.dirname(result[mode][resource].path), { recursive: true });
            fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
        }
    }
  });
}

async function createInjectedSprite() {
  let jsonSprite = getSvgJson(`${SVG_FOLDER}${SVG_SPRITE_SUBFOLDER}/${SVG_SPRITE_NAME}`);
  let spriteCopy = JSON.parse(JSON.stringify(jsonSprite));
  spriteCopy.children.forEach(symbol => {
    modifyAttributes(symbol,new Map(),new Map());
  });
  fs.writeFileSync(`${SVG_FOLDER}${SVG_SPRITE_SUBFOLDER}/${SVG_SPRITE_NAME}`, svgson.stringify(spriteCopy));
}

function modifyAttributes(el, registeredColors, registeredStrokeWidths) {
  // TODO: Make Gradients work! (stop-color)
  if(el.attributes){
    if(CHAMELEON_CONFIG.colors.modifiable){
      // FILL
      let fill = el.attributes.fill;
      if(fill && isValidPaint(fill)) {
        if(registeredColors.get(fill)) {
          // If fill color has already an assigned variable
          el.attributes.fill = registeredColors.get(fill);
        } else {
          // If fill is a new color (gets registered)
          let varFill = variablizeColor(fill, registeredColors.size + 1);
          registeredColors.set(fill, varFill);
          el.attributes.fill = varFill;
        }
      }
      // STROKE
      let stroke = el.attributes.stroke;
      if(stroke && isValidPaint(stroke)) {
        if(registeredColors.get(stroke)) {
          // If stroke has already an assigned variable
          el.attributes.stroke = registeredColors.get(stroke);
        } else {
          // If color is a new color (gets registered)
          let varStroke = variablizeColor(stroke, registeredColors.size + 1);
          registeredColors.set(stroke, varStroke);
          el.attributes.stroke = varStroke;
        }
      }
    }
    // STROKE-WIDTH
    if(CHAMELEON_CONFIG.strokeWidths.modifiable) {
      let strokeWidth = el.attributes['stroke-width'];
      if(strokeWidth && isValidLength(strokeWidth)) {
        if(registeredStrokeWidths.get(strokeWidth)) {
          // If stroke-width has already an assigned variable
          el.attributes['stroke-width'] = registeredStrokeWidths.get(strokeWidth);
        } else {
          // If stroke-width is a new stroke-width (gets registered)
          let varStrokeWidth = variablizeStrokeWidth(strokeWidth, registeredStrokeWidths.size + 1);
          registeredStrokeWidths.set(strokeWidth, varStrokeWidth);
          el.attributes['stroke-width'] = varStrokeWidth;
        }
      }
    }
    // NON SCALING STROKE-WIDTH
    if(CHAMELEON_CONFIG.strokeWidths.nonScaling && el.attributes['stroke-width']) {
      let vectorEffect = el.attributes['vector-effect'];
      if(vectorEffect && !vectorEffect.includes('non-scaling-stroke')) {
        el.attributes['vector-effect'] = vectorEffect + ' non-scaling-stroke';
      } else if(!vectorEffect) {
        el.attributes['vector-effect'] = 'non-scaling-stroke';
      }
    }
  }
  // RECURSIVE FOR ALL CHILDREN
  if(el.children.length) {
    el.children.forEach(child => {
      modifyAttributes(child, registeredColors, registeredStrokeWidths);
    });
  }
}

function variablizeColor(p_color, id) {
  const varStrSpecific = `--${CHAMELEON_CONFIG.colors.naming}-${id}`;
  const varStrGeneral = `--${CHAMELEON_CONFIG.colors.naming}`;
  const color = CHAMELEON_CONFIG.colors.preserveOriginal ? p_color : 'currentColor';
  return `var(${varStrSpecific}, var(${varStrGeneral}, ${color}))`;
}

function variablizeStrokeWidth(strokeWidth, id) {
  const varStrSpecific = `--${CHAMELEON_CONFIG.strokeWidths.naming}-${id}`;
  const varStrGeneral = `--${CHAMELEON_CONFIG.strokeWidths.naming}`;
  return `var(${varStrSpecific}, var(${varStrGeneral}, ${strokeWidth}))`;
}

function isValidLength(str) {
  const trimmedStr = String(str).trim();
  // Check if CSS length unit
  if(trimmedStr.match(/(\d*\.?\d+)\s?(px|em|ex|%|in|cn|mm|pt|pc+)?/i)) {
    return true;
  }
  return false;
}

function isValidPaint(str) {
  const trimmedStr = String(str).trim();
  const htmlColorNames = [
    'black','silver','gray','white','maroon','red','purple','purple','fuchsia',
    'green','lime','olive','yellow','navy','blue','teal','aqua'
  ]
  // Check for Hex or HTML color name
  if (trimmedStr.match(/^#(?:[0-9a-f]{3}){1,2}$/i) || htmlColorNames.includes(trimmedStr.toLowerCase())) {
    return true;
  }
  // TODO: RGB, RGBA, "transparent", just check if valid Paint Unit...
  // https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint
  // Question: allow "none" to be customizable?
  // Basically just check if not already "var()" is enough??
  return false;
}

function getSvgJson(path) {
  let file;
  try {
    file = fs.readFileSync(path);
  } catch (err) {
    console.error(err);
  }
  return svgson.parseSync(file.toString());
}

function getFolderPath(arg) {
  const defaultFolder = '/src/assets/svg/';
  if(!arg) {
    console.log(chalk.grey(`No SVG folder specified, defaulting to '${defaultFolder}'.`));
    return process.cwd() + defaultFolder;
  } else {
    return arg.endsWith('/') ? process.cwd() + arg : process.cwd() + arg +'/';
  }
}

function handleError(err) {
  console.error(err);
}