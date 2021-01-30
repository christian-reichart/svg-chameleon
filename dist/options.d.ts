import { ChameleonOptions } from './lib/interfaces';
/**
 * Get default options
 * Return a new instance to prevent possible mutabillity issues
 */
export declare const getDefaultOptions: () => ChameleonOptions;
/**
 * Get options from config file
 *
 * @param { string | undefined } path
 */
export declare const getOptionsFromConfigFile: (path: string | undefined) => Promise<ChameleonOptions>;
