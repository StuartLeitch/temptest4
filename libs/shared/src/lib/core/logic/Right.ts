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

  chain<B>(fn: (a: A) => Either<L, B>): Either<L, B> {
    return fn(this.value);
  }
}
