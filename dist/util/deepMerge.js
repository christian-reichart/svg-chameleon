"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = void 0;
/**
 * Merge a `source` object to a `target` recursively
 */
exports.deepMerge = (target, source) => {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object)
            Object.assign(source[key], exports.deepMerge(target[key], source[key]));
    }
    // Join `target` and modified `source`
    return Object.assign(target || {}, source);
};
//# sourceMappingURL=deepMerge.js.map