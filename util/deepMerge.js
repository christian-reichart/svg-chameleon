/**
 * Merge a `source` object to a `target` recursively
 * 
 * @param {string} path
 */
const deepMerge = (target, source) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) Object.assign(source[key], deepMerge(target[key], source[key]))
  }
  // Join `target` and modified `source`
  return Object.assign(target || {}, source)
}

exports.deepMerge = deepMerge;