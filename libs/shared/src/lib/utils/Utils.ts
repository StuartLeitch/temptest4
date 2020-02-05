
export function reduce(src, schema, initial) {
  let ret = initial;
  if (src == null || schema == null)
    return ret;

  for (const [path, value] of delve(src)) {
    const key = `/${path.join('/')}`;
    const handler = schema[key];
    if (isFunction(handler)) {
      ret = handler(ret, value, src);
    }
  }

  return ret;
}

export function typeOf(object, exceptNull=false) {
  if (object === null && exceptNull)
    return 'null';

  if (Array.isArray(object))
    return 'array';

  return typeof object;
}

export function isFunction(object) {
  return typeOf(object) == 'function';
}

export function nonEmpty(object) {
  switch (typeOf(object, true)) {
    case 'array':
      return object.length > 0;
    case 'object':
      return Object.keys(object).length > 0;
    default:
      return object != null;
  }
}

export function* delve(object, skipEmpty=true) {
  // TODO: Add support for `skipEmpty` given as `string` or `array`
  if (object == null)
    return;

  yield* walk([], object);

  function* walk(path, here) {
    for (const [key, value] of Object.entries(here)) {
      if (value === undefined)
        continue;

      if (skipEmpty && !nonEmpty(value))
        continue;

      if (typeOf(value) != 'object') {
        yield [[...path, key], value];
      } else {
        yield* walk([...path, key], value);
      }
    }
  }
}

export function entryOf(object) {
  if (object == null)
    return [];

  return Object.entries(object)[0] ?? [];
}
