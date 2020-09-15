# SVG Chameleon

With SVG Chameleon you can transform your SVG files into a sprite of symbols, that can be implemented in the frontend via ```<use>```. They can then be manipulated via CSS to change color (multi-color support!) or stroke-width in a consistent way.

## Installation

``` bash
# install from T23 git
npm install -g git+ssh://git@git.team23.de:team23/svg-chameleon.git
```

## Usage

``` bash
# Create Chameleon Sprite from folder containing your SVG files
svg-chameleon /path/to/svg/folder/
```
> The provided path is optional and should be relative to your current working directory.

> For testing purposes the script defaults to /src/assets/svg/ if no path is provided...

## TODO

Describe in detail how the sprite can be implemented and styled...


