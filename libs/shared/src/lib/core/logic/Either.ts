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

export type Either<L, A> = Left<L, A> | Right<L, A>;

export const left = <L = unknown, A = unknown>(l: L): Either<L, A> => {
  return new Left<L, A>(l);
};

export const right = <L = unknown, A = unknown>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};

/**
 * This functions combines multiple Eithers into one Either with an array of the right values from the initial Eithers
 * @param args Multiple Eithers of different signature
 */
function combine<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(...args: [Either<A, B>, Either<C, D>, Either<E, F>, Either<G, H>, Either<I, J>, Either<K, L>, Either<M, N>]): Either<A | C | E | G | I | K | M, [B, D, F, H, J, L, N]>;
function combine<A, B, C, D, E, F, G, H, I, J, K, L>(...args: [Either<A, B>, Either<C, D>, Either<E, F>, Either<G, H>, Either<I, J>, Either<K, L>]): Either<A | C | E | G | I | K, [B, D, F, H, J, L]>;
function combine<A, B, C, D, E, F, G, H, I, J>(...args: [Either<A, B>, Either<C, D>, Either<E, F>, Either<G, H>, Either<I, J>]): Either<A | C | E | G | I, [B, D, F, H, J]>;
function combine<A, B, C, D, E, F, G, H>(...args: [Either<A, B>, Either<C, D>, Either<E, F>, Either<G, H>]): Either<A | C | E | G, [B, D, F, H]>;
function combine<A, B, C, D, E, F>(...args: [Either<A, B>, Either<C, D>, Either<E, F>]): Either<A | C | E, [B, D, F]>;
function combine<A, B, C, D>(...args: [Either<A, B>, Either<C, D>]): Either<A | C, [B, D]>;
function combine(...args: Array<Either<unknown, unknown>>) {
  const result = [];

  for (const e of args) {
    if (e.isRight()) {
      result.push(e.value);
    } else {
      return e;
    }
  }

  return right(result);
}

/**
 * This functions transforms an array of Eithers with the same type signature into an Either of Error or Array
 * @param arr The array of Eithers with the same signature
 */
function flatten<A, B>(arr: Array<Either<A, B>>): Either<A, Array<B>> {
  const result: Array<B> = [];

  for(const e of arr) {
    if(e.isRight()) {result.push(e.value)}
    else {return e as unknown as Either<A, Array<B>>}
  }

  return right(result);
}

/**
 * Unwraps the provided Either to value if it is Right, or null if it is Left
 * @param either 
 * @returns The Right value or null
 */
function valueOrNull<T>(either: Either<unknown, T>): T | null {
  if(either.isRight()) {
    return either.value;
  }
  
  return null
}

/**
 * Unwraps the provided Either to value if it is Right, or throws the value if it is Left
 * @param either 
 * @returns The Right value
 * @throws The Left value
 */
function throwOrValue<T>(either: Either<any, T>): T {
  if(either.isRight()) {
    return either.value;
  }

  throw either.value;
}

export { 
  throwOrValue,
  valueOrNull,
  combine,
  flatten,
};
