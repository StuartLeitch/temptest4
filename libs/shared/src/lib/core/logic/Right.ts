import { Either } from './Result';
import { Left } from './Left';

export class Right<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return false;
  }

  isRight(): this is Right<L, A> {
    return true;
  }

  map<B>(fn: (a: A) => B): Either<L, B> {
    return new Right<L, B>(fn(this.value));
  }

  chain<L2, B>(fn: (a: A) => Either<L2, B>): Either<L | L2, B> {
    return fn(this.value);
  }
}
