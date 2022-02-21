import { cloneDeep } from 'lodash';

import { Either, Right, right } from './Either';

type MutationFunction<T = unknown> = (r: unknown) => T;

type MappingFunction<L = unknown, R = unknown> = (
  val: Either<L, R>
) => (fn: MutationFunction) => Promise<Either<L, R>> | Either<L, R>;

interface ObjectMapping<L = unknown, R = unknown> {
  default: MappingFunction<L, R>;
  guard: MappingFunction<L, R>;
  then: MappingFunction<L, R>;
  map: MappingFunction<L, R>;
}

type MutationType = keyof Omit<ObjectMapping, 'default'>;

interface Mutation {
  fn: MutationFunction;
  type: MutationType;
}

class GuardError {}

function allFilters<R>(
  filters: { (r: R): Promise<Either<unknown, boolean>> }[]
) {
  return async (r: R) => {
    let finalResult = right<unknown, boolean>(true);
    for (const fn of filters) {
      const result = await fn(r);
      finalResult = finalResult.chain((val) =>
        result.map((resVal) => val && resVal)
      );
    }
    return finalResult;
  };
}

export function flattenEither<L, R>(eithers: Either<L, R>[]): Either<L, R[]> {
  const response: R[] = [];
  for (const either of eithers) {
    if (either.isLeft()) {
      return (either as unknown) as Either<L, R[]>;
    }
    response.push(either.value);
  }

  return right(response);
}

export async function asyncFlattenEither<L, R>(
  eithers: Promise<Either<L, R>>[]
): Promise<Either<L, R[]>> {
  return Promise.all(eithers).then(flattenEither);
}

function advancePastGuard<L, R, L2, R2>(val: Either<L, R>) {
  return async (fn: MutationFunction<Promise<Either<L2, R2>>>) => {
    if (val.isLeft()) return val;

    const maybeResult: Either<unknown, unknown> = await fn(val.value);

    if (maybeResult.isRight()) {
      if (maybeResult.value) {
        return val;
      } else {
        throw new GuardError();
      }
    }
    return maybeResult;
  };
}

function emptyMapping<L, R>(val: Either<L, R>) {
  return async () => val;
}

function doThen<L, R>(val: Either<L, R>) {
  return async (fn: MutationFunction<Either<L, R>>) => {
    return val.chain<L, R>(fn);
  };
}

function doMap<L, R>(val: Either<L, R>) {
  return async (fn: MutationFunction<R>) => {
    return val.map<R>(fn);
  };
}

type ChainFunction<R, L2, R2> = (
  r: R
) => Promise<Either<L2, R2>> | Either<L2, R2>;

export class AsyncEither<L = null, R = unknown> {
  private readonly value: R;
  private mutations: Mutation[];

  constructor(value: R) {
    this.value = value;
    this.mutations = [];
  }

  map<R2>(fn: (r: R) => R2): AsyncEither<L, R2> {
    const newInstance = this.clone();
    newInstance.mutations.push({ type: 'map', fn });
    return (newInstance as unknown) as AsyncEither<L, R2>;
  }

  then<L2, R2>(fn: (r: R) => Promise<Either<L2, R2>>): AsyncEither<L2 | L, R2> {
    const newInstance = this.clone();
    newInstance.mutations.push({ type: 'then', fn });
    return (newInstance as unknown) as AsyncEither<L2 | L, R2>;
  }

  chain<L2, R2>(fn: ChainFunction<R, L2, R2>): AsyncEither<L2 | L, R2> {
    const newInstance = this.clone();
    newInstance.mutations.push({ type: 'then', fn });
    return (newInstance as unknown) as AsyncEither<L2 | L, R2>;
  }

  advanceOrEnd(
    ...fns: { (r: R): Promise<Either<unknown, boolean>> }[]
  ): AsyncEither<L, R> {
    const newInstance = this.clone();
    newInstance.mutations.push({ type: 'guard', fn: allFilters(fns) });
    return newInstance;
  }

  private clone() {
    return cloneDeep(this);
  }

  async execute(): Promise<Either<L, R>> {
    let val: Either<L, R> = new Right(this.value);

    try {
      for (const mutation of this.mutations) {
        val = await this.functionToApply<L, R>(mutation.type, val)(mutation.fn);
      }
    } catch (e) {
      if (!(e instanceof GuardError)) {
        throw e;
      }
    }

    return val;
  }

  private functionToApply<L, R>(type: MutationType, val: Either<L, R>) {
    const objectMapping: ObjectMapping<L, R> = {
      guard: advancePastGuard,
      default: emptyMapping,
      then: doThen,
      map: doMap,
    };
    return (objectMapping[type] || objectMapping.default)(val);
  }

  static async asyncAll<L, R>(
    eithers: Promise<Either<L, R>>[]
  ): Promise<Either<L, R[]>> {
    return Promise.all(eithers).then(flattenEither);
  }

  static all<L, R>(eithers: Either<L, R>[]): Either<L, R[]> {
    const response: R[] = [];
    for (const either of eithers) {
      if (either.isLeft()) {
        return (either as unknown) as Either<L, R[]>;
      }
      response.push(either.value);
    }

    return right(response);
  }
}
