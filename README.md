# SVG Chameleon

SVG Chameleon creates a ```<symbol>``` sprite out of your SVG files that lets you easily modify colors and stroke-widths via CSS variables. It works with any SVGs, so no need for the designer or the developer to fiddle around with export options or the SVG markup. Thanks to the injected CSS variables, you don't need to worry about the Shadow DOM or specific tags of your SVG, just set your variables somewhere and they will cascade down to your SVG markup.

## Installation

``` bash
# install from git
npm i git+https://github.com/christian-reichart/svg-chameleon

# install globally for access over multiple projects
npm i -g git+https://github.com/christian-reichart/svg-chameleon
```

> npm release coming soon...

## Usage

Create a chameleon sprite from a directory containing your svg files. (the sprite will be generated inside a subdirectory).

``` bash
# If installed locally in your project
npx svg-chameleon --path=path/to/svg/directory/

# Or if installed globally
svg-chameleon --path=path/to/svg/directory/
```

## TODO

TODO, please be patient. :)


