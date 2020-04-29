import _ from 'lodash';

function mergeCustomizer(objValue, srcValue) {
  return objValue || srcValue;
}

function overwriteCustomizer(objValue, srcValue) {
  return objValue || srcValue;
}

// * Simply merge the process.env object with the config isObject
// * The keys that are duplicated across the objects are ‘overwritten’
// * by subsequent objects with the same key.

export function mergeWith(target, source) {
  return _.mergeWith(target, source, mergeCustomizer);
}

export function overwriteWith(target, source) {
  return _.mergeWith(target, source, overwriteCustomizer);
}
