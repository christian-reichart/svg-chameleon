const findUp = require('find-up');
const { join } = require('path');

const configFiles = ['chameleon.js', 'chameleon.json'];
const defaultOptions = {
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


async function getOptions() {
  const options = await getOptionsFromFile();
  const path = join(process.cwd(), options.path);

  return { ...options, path };
}


async function getOptionsFromFile() {
  const path = await findUp(configFiles);

  if (path === undefined) {
    return defaultOptions;
  }

  try {
    return require(path);
  } catch (error) {
    throw new Error(`Could not load config file from ${path}`);
  }
}

module.exports = getOptions;
