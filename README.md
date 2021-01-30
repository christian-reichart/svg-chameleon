# SVG Chameleon

SVG Chameleon creates a ```<symbol>``` sprite out of your SVG files that lets you easily modify colors and stroke-widths via CSS variables. It works with any SVGs, so no need for the designer or the developer to fiddle around with export options or the SVG markup. Thanks to the injected CSS variables, you don't need to worry about the Shadow DOM or specific tags of your SVG, just set your variables somewhere and they will cascade down to your SVG markup.

## How it works

SVG Chameleon does two things:

It creates a SVG symbol sprite using [svg-sprite](https://www.npmjs.com/package/svg-sprite).

It injects CSS variables into the SVG code. For example, this following SVG symbol:

```html
<symbol viewBox="0 0 100 100" id="circle-1">
  <circle cx="50" cy="50" r="40"
    fill="yellow"
    stroke="green"
    stroke-width="4"
  />
</symbol>
```

would be converted to:

```html
<symbol viewBox="0 0 100 100" id="circle-1">
  <circle cx="50" cy="50" r="40"
    fill="var(--svg-custom-color, yellow)"
    stroke="var(--svg-custom-color-2, green)"
    stroke-width="var(--svg-custom-stroke-width, 4)"
  />
</symbol>
```

You can now just set these variables in your CSS and it will affect the SVG, even though it is in the shadow-DOM.
Just set these variables globally or scoped for specific SVGs.

```css
.circle-wrapper {
  --svg-custom-color: blue;
  --svg-custom-color-2: red;
}
```

Provided you wrap the SVG with a ```<div class="circle-wrapper>```, the CSS above would result in the circle having a blue fill, a red outline and a stroke-width of 4 (original value, since no variable was specified). You can also set transitions on the SVG for smooth animations. See options below.

> Note: The specific namings (like ```--svg-custom-color``` and ```--svg-custom-color-2```) are scoped to each SVG, meaning the original value of ```--svg-custom-color``` on one SVG doesn't necessarily have to be the same on another SVG. If you want consistent variables for specific colors, you can set custom vars in the options.

## Installation

``` bash
# install locally to your project with npm
npm i svg-chameleon
```

``` bash
# Alternative: install globally for CLI usage in multiple projects
npm i svg-chameleon -g
```

## Usage in Code

```javascript
const chameleon = require('svg-chameleon');

(async () => {
  await chameleon.create({ path: 'path/to/svg/directory/' });
})();
```

## Command Line Usage

``` bash
# Local usage
npx svg-chameleon --path=path/to/svg/directory/
```

``` bash
# Global usage
svg-chameleon --path=path/to/svg/directory/
```

## Options

The creation of the chameleon sprite can be customized with various options. All options can be [saved in a config file](#options-as-js-or-json-config-file) or [used in the CLI](#command-line-options) directly.

### Options as JS object

```javascript
module.exports = {
  path: 'path/to/svg/directory/',           // default: '' (current working directory)
  subdirName: 'my-sprite-dir',              // default: 'chameleon-sprite' (created inside your SVG directory, stores all generated files)
  fileName: 'my-sprite',                    // default: 'chameleon-sprite' (used for .svg, .scss and .css files)
  scss: true,                               // default: false (creates scss with classes for dimensions)
  css: true,                                // default: false (creates css with classes for dimensions)
  colors: {
    apply: false,                           // default: true
    name: 'my-color-var-naming',            // default: 'svg-custom-color' (additional colors are named 'svg-custom-color-2' and so on)
    preserveOriginal: false,                // default: true (if false, replaces original color with 'currentColor')
    customVars: {
      '#D8D8D8': 'color-grey',              // this would result in --color-grey for every color attribute with '#D8D8D8'
      '#A3FF5E': 'color-primary'
    }
  },
  strokeWidths: {
    apply: false,                           // default: true
    name: 'my-stroke-width-var-naming',     // default: 'svg-custom-stroke-width' (additional stroke-widths are named 'svg-custom-stroke-width-2' and so on)
    nonScaling: true,                        // default: false (if true, preserves the stroke-width when scaling the SVG)
    customVars: {
      '1': 'stroke-thin',                   // this would result in --stroke-thin for every stroke-width with '1'
      '3.5': 'stroke-bold'
    }
  },
  transition: {
    apply: true,                            // default: false (automatically true if one of the other transition options is given)
    name: 'my-transition-var-name',         // default: svg-custom-transition
    default: 'all .3s'                      // fallback, if no transition variable is assigned in your CSS
  }
};
```

### Options as JS or JSON config file

The above Javascript options can be persisted as either JS or a JSON configuration file. The file must be named chameleon.config.js or chameleon.config.json.

The tool automatically searches for a configuration file in the directory where it was started and by going up in parent directories.

Alternatively a `--config` option with a path to the configuration file can be passed to the cli.

### Command line options

| option |  example | corresponding options property |
|--|--|--|
| `--config` | `--config=path/to/chameleon.config.js` |  |
| `--path` | `--path=path/to/svg/directory/` | path |
| `--subdir-name` | `--subdir-name=my-sprite-dir` | subdirName |
| `--file-name` | `--file-name=my-sprite` | fileName |
| `--css` | `--css` | css |
| `--scss` | `--scss` | scss |
| `--c-apply` | `--c-apply=false` | colors.apply |
| `--c-name` | `--c-name=my-color-var-naming` | colors.name |
| `--c-preserve` | `--c-preserve=false` | colors.preserveOriginal |
| `--c-custom-vars` | `--c-custom-vars='#D8D8D8:color-grey,#A3FF5E:color-primary'` | colors.customVars |
| `--sw-apply` | `--sw-apply=false` | strokeWidths.apply |
| `--sw-name` | `--sw-name=my-stroke-width-var-naming` | strokeWidths.name |
| `--sw-non-scaling` | `--sw-non-scaling` | strokeWidths.noScaling |
| `--sw-custom-vars` | `--sw-custom-vars='1:stroke-thin,3.5:stroke-bold'` | strokeWidths.customVars |
| `--t-apply` | `--t-apply` | transition.apply |
| `--t-name` | `--t-name=my-transition-var-name` | transition.name |
| `--t-default` | `--t-default='all .3s'` | transition.default |


