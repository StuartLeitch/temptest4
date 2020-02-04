import { Either } from './Result';
import { Right } from './Right';

type MutationType = 'map' | 'chain' | 'asyncChain';
type MutationFunction = (r: any) => any;

type ObjectMapping<L, R> = {
  [key in MutationType | 'default']: (
    val: Either<L, R>
  ) => (fn: MutationFunction) => Promise<Either<L, R>> | Either<L, R>;
};

interface Mutation {
  fn: MutationFunction;
  type: MutationType;
}

export class AsyncEither<L, R> {
  private readonly value: R;
  private mutations: Mutation[];

  constructor(value: R) {
    this.value = value;
    this.mutations = [];
  }

  map<R2>(fn: (r: R) => R2) {
    this.mutations.push({ type: 'map', fn });
    return (this as unknown) as AsyncEither<L, R2>;
  }

  asyncChain<L2, R2>(fn: (r: R) => Promise<Either<L2, R2>>) {
    this.mutations.push({ type: 'asyncChain', fn });
    return (this as unknown) as AsyncEither<L2 | L, R2>;
  }

  chain<L2, R2>(fn: (r: R) => Either<L2, R2>) {
    this.mutations.push({ type: 'chain', fn });
    return (this as unknown) as AsyncEither<L2 | L, R2>;
  }

  async execute(): Promise<Either<L, R>> {
    let val: Either<L, R> = new Right(this.value);
    for (const mutation of this.mutations) {
      val = await this.functionToApply<L, R>(mutation.type, val)(mutation.fn);
    }

    return val;
  }

  private functionToApply<L, R>(type: MutationType, val: Either<L, R>) {
    const objectMapping: ObjectMapping<L, R> = {
      asyncChain: (val: Either<L, R>) => (fn: MutationFunction) =>
        (val.chain(fn) as unknown) as Promise<Either<L, R>>,
      chain: (val: Either<L, R>) => (fn: MutationFunction) =>
        val.chain<L, R>(fn),
      map: (val: Either<L, R>) => (fn: MutationFunction) => val.map<R>(fn),
      default: (val: Either<L, R>) => () => val
    };
    return (objectMapping[type] || objectMapping.default)(val);
  }
}
