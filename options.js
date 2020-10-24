const findUp = require('find-up');
const { getAbsolutePath } = require('./util');

const configFileNames = ['chameleon.config.js', 'chameleon.config.json'];

/**
 * Get default options
 * Return a new instance to prevent possible mutabillity issues
 */
const getDefaultOptions = () => ({
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
});

/**
 * Get config path 
 * 
 * @param { string | undefined } path 
 */
const getConfigPath = async (path) => {
  return path !== undefined ? getAbsolutePath(path) : await findUp(configFileNames)
}

/**
 * Get options from config file
 * 
 * @param { string | undefined } path 
 */
const getOptionsFromConfigFile = async (path) => {
  const configPath = await getConfigPath(path);

  try {
    return configPath !== undefined ? require(configPath) : {};
  } catch (error) {
    throw new Error(`Could not load config file from ${path}`);
  }
}

exports.getDefaultOptions = getDefaultOptions;
exports.getOptionsFromConfigFile = getOptionsFromConfigFile;
