module.exports = {
  path: './test/svg',
  subdirName: '../chameleon-sprite',
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
