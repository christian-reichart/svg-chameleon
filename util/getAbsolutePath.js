
const { isAbsolute, join } = require('path');

/**
 * Convert path to absolute path
 * 
 * @param {string} path
 */
exports.getAbsolutePath = (path) => isAbsolute(path) === true ? path : join(process.cwd(), path);