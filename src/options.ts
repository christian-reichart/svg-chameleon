import  findUp from 'find-up';
import chalk from 'chalk';
import { getAbsolutePath } from './util';
import { ChameleonOptions } from './lib/interfaces';

const configFileNames = ['chameleon.config.js', 'chameleon.config.json'];

/**
 * Get default options
 * Return a new instance to prevent possible mutabillity issues
 */
export const getDefaultOptions = (): ChameleonOptions => ({
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
    default: undefined,
  },
});

/**
 * Get config path
 *
 * @param { string | undefined } path
 */
const getConfigPath = async (path: string | undefined): Promise<string | undefined> => {
  return path !== undefined ? getAbsolutePath(path) : await findUp(configFileNames)
}

/**
 * Get options from config file
 *
 * @param { string | undefined } path
 */
export const getOptionsFromConfigFile = async (path: string | undefined): Promise<ChameleonOptions> => {
  const configPath = await getConfigPath(path);

  try {
    if(configPath) {
      console.log(chalk.grey(`Found config file under '${configPath}.'`));
    }
    return configPath !== undefined ? require(configPath) : {};
  } catch (error) {
    throw new Error(`There was a problem loading your config file. ` + error);
  }
}

