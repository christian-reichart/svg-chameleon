import { ChameleonOptions } from './lib/interfaces';
import { PlainObjectType } from './lib/types';
/**
 * Get default options
 * Return a new instance to prevent possible mutabillity issues
 */
export const getDefaultOptions = (): ChameleonOptions => ({
  path: '',
  dest: '',
  name: 'chameleon-sprite',
  dimensionStyles: {
    css: {
      create: false,
      dest: undefined,
      name: undefined,
    },
    scss: {
      create: false,
      dest: undefined,
      name: undefined,
    }
  },
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

function getCustomVarsAsObject(customVars: PlainObjectType | string): PlainObjectType {

  let obj: PlainObjectType = {};

  if (typeof customVars !== 'string') {
    obj = customVars;
  } else {
    let splits = customVars.split(',');
    splits.forEach((pair: string) => {
      let pairSplits = pair.split(':');
      if (pairSplits.length !== 2) {
        throw new Error("Couldn't parse format for custom vars! Please use '<to-replace>:<custom-var-name>'.");
      }
      obj[pairSplits[0]] = pairSplits[1];
    });
  }

  return obj;
}

function setupCustomVars(customVars: Array<PlainObjectType> | PlainObjectType): PlainObjectType {
  return getCustomVarsAsObject(customVars);
}

export const setupOptions = (options: ChameleonOptions): ChameleonOptions => {

  return {
    ...options,
    colors: {
      ...options.colors,
      customVars: setupCustomVars(options.colors.customVars || {}),
    },
    strokeWidths: {
      ...options.strokeWidths,
      customVars: setupCustomVars(options.strokeWidths.customVars || {}),
    },
  };
};
