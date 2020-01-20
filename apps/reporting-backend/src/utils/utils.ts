export function makeCallback(callback) {
  let cb = callback;
  if (typeof cb === 'function') return cb;

  let result;
  if (Array.isArray(cb)) {
    result = cb;
  } else {
    result = [];
    cb._result = result;
  }
  cb = entry => {
    result.push(entry);
  };

  return cb;
}
