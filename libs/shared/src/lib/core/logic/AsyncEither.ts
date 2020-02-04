import { Either } from './Result';
import { Right } from './Right';

interface Mutation {
  type: 'map' | 'chain';
  fn: (r: any) => any;
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

  chain<L2, R2>(fn: (r: R) => Promise<Either<L2, R2>>) {
    this.mutations.push({ type: 'chain', fn });
    return (this as unknown) as AsyncEither<L2 | L, R2>;
  }

  async execute(): Promise<Either<L, R>> {
    let val: Either<L, R> = new Right(this.value);
    for (const mutation of this.mutations) {
      if (mutation.type === 'map') {
        val = val.map(mutation.fn);
      } else {
        val = await ((val.chain(mutation.fn) as unknown) as Promise<
          Either<any, any>
        >);
      }
    }

    return val;
  }
}
