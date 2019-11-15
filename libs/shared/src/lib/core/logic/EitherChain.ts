import { Right } from './Right';
import { Either } from './Result';

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

export async function chain<A>(fns: Function[], init: Either<any, A> | A) {
  if (isEither(init) && init.isLeft()) {
    return init;
  }
  const initValue = new Right<any, A>(getValueOfA(init));
  let p = Promise.resolve(initValue);

  for (let i = 0; i < fns.length; i++) {
    p = p.then(async cumRes => {
      if (cumRes.isLeft()) {
        return cumRes;
      }
      const next = fns[i];
      const { value } = cumRes;
      return next(value);
    });
  }

  return p;
}
