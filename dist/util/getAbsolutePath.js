"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbsolutePath = void 0;
const path_1 = require("path");
/**
 * Convert path to absolute path
 *
 * @param {string} path
 */
exports.getAbsolutePath = (path) => path_1.isAbsolute(path) === true ? path : path_1.join(process.cwd(), path);
//# sourceMappingURL=getAbsolutePath.js.map