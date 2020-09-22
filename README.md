# SVG Chameleon

SVG Chameleon creates a ```<symbol>``` sprite out of your SVG files that lets you easily modify colors and stroke-widths via CSS variables. It works with any SVGs, so no need for the designer or the developer to fiddle around with export options or the SVG markup. Thanks to the injected CSS variables, you don't need to worry about the Shadow DOM or specific tags of your SVG, just set your variables somewhere and they will cascade down to your SVG markup.

## Installation

``` bash
# install locally to your project from git
npm i git+https://github.com/christian-reichart/svg-chameleon

# Alternative: install globally for CLI usage in multiple projects
npm i git+https://github.com/christian-reichart/svg-chameleon -g
```

> npm release coming soon...

## How it works

> TODO

## Command Line Usage

``` bash
# Local usage
npx svg-chameleon --path=path/to/svg/directory/

# Global usage
svg-chameleon --path=path/to/svg/directory/
```

## Usage in Code

> TODO

## Options

The creation of the chameleon sprite can be customized with various options.

### Options as JS object

> TODO options object with commentary

### Command line options

| option |  example | corresponding options property |
|--|--|--|
| `--path` | `--path=assets/svg/` | path |
| `--subdir-name` | `--subdir-name=my-sprite-dir` | subdirName |
| `--file-name` | `--subdir-name=my-sprite` | fileName |
| `--css` | `--css=true` | css |
| `--scss` | `--scss=true` | scss |
| `--c-apply` | `--c-apply=false` | colors.apply |
| `--c-name` | `--c-name=my-color-var-naming` | colors.name |
| `--c-preserve` | `--c-preserve=false` | colors.preserveOriginal |
| `--c-custom-vars` | `--c-custom-vars=#D8D8D8:color-grey,#A3FF5E:color-secondary` | colors.customVars |
| `--sw-apply` | `--sw-apply=false` | strokeWidths.apply |
| `--sw-name` | `--sw-name=my-stroke-width-var-naming` | strokeWidths.name |
| `--sw-no-scaling` | `--sw-no-scaling=true` | strokeWidths.noScaling |
| `--sw-custom-vars` | `--sw-custom-vars=1:stroke-thin,3.5:stroke-bold` | strokeWidths.customVars |
| `--t-apply` | `--t-apply=true` | transition.apply |
| `--t-name` | `--t-name=my-transition-var-name` | transition.name |
| `--t-default` | `--t-default='all .3s'` | transition.default |


