import { Left } from './Left';
import { Right } from './Right';

export type Either<L, A> = Left<L, A> | Right<L, A>;

export const left = <L = unknown, A = unknown>(l: L): Either<L, A> => {
  return new Left<L, A>(l);
};

export const right = <L = unknown, A = unknown>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};
