export function makeCallback(callback): Function {
  let cb = callback;
  if (typeof cb === 'function') return cb;

  let result;
  if (Array.isArray(cb)) {
    result = cb;
  } else {
    result = [];
    cb._result = result;
  }
  return entry => {
    result.push(entry);
  };
}

export function differenceInSeconds(start: Date, end: Date = new Date()) {
  return (end.getTime() - start.getTime()) / 1000;
}
