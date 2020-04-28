import _ from 'lodash';

function customizer(objValue, srcValue) {
  return objValue || srcValue;
}

// * Simply merge the process.env object with the config isObject
// * The keys that are duplicated across the objects are ‘overwritten’
// * by subsequent objects with the same key.

export function mergeWith(target, source) {
  return _.mergeWith(target, source, customizer);
}
