import _ from 'lodash';

function mergeCustomizer(objValue: any, srcValue: any): any {
  return objValue || srcValue;
}

function overwriteCustomizer(objValue: any, srcValue: any) {
  return objValue || srcValue;
}

// * Simply merge the process.env object with the config isObject
// * The keys that are duplicated across the objects are ‘overwritten’
// * by subsequent objects with the same key.

export function mergeWith(target: any, source: any): any {
  return _.mergeWith(target, source, mergeCustomizer);
}

export function overwriteWith(target: any, source: any): any {
  return _.mergeWith(target, source, overwriteCustomizer);
}
