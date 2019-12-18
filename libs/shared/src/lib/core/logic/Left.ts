import { Either } from './Result';
import { Right } from './Right';

export class Left<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return true;
  }

  isRight(): this is Right<L, A> {
    return false;
  }

  map<B>(fn: (a: A) => B): Either<L, B> {
    return (this as unknown) as Left<L, B>;
  }

  chain<L2, B>(fn: (a: A) => Either<L2, B>): Either<L | L2, B> {
    return (this as unknown) as Left<L | L2, B>;
  }
}
