import {Right} from './Right';
import {Either} from './Result';

function isEither<A>(a: Either<any, A> | A): a is Either<any, A> {
  if ('isLeft' in a || 'isRight' in a) {
    return true;
  } else {
    return false;
  }
}

function getValueOfA<A>(a: Right<any, A> | A) {
  if (isEither(a)) {
    return a.value;
  } else {
    return a;
  }
}

export async function map<A>(fns: Function[], init: Either<any, A> | A) {
  if (isEither(init) && init.isLeft()) {
    return init;
  }
  const initValue = getValueOfA(init);
  let p = Promise.resolve(initValue);

  for (let i = 0; i < fns.length; i++) {
    p = p.then(async cumRes => {
      const next = fns[i];
      return next(cumRes);
    });
  }

  return new Right<any, A>(await p);
}
