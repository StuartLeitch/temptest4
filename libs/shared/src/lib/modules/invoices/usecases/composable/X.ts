import {UseCaseRequest} from './UseCaseRequest';
import {FooUseCase} from './Foo';
import {BarUseCase} from './Bar';
import {BazUseCase} from './Baz';

const isFunction = (functionToCheck: Function) =>
  functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

const combinePromises = (operationsMap: any, init: any = {}) => {
  let p = Promise.resolve(init);

  // tslint:disable-next-line: forin
  for (const k in operationsMap) {
    p = p.then(cumRes => {
      const next = operationsMap[k];
      return Promise.resolve(isFunction(next) ? next(cumRes) : next).then(
        res => {
          cumRes[k] = res;
          return cumRes;
        }
      );
    });
  }
  return p;
};

export class ComboUseCase {
  constructor(
    private foo: FooUseCase,
    private bar: BarUseCase,
    private baz: BazUseCase
  ) {}

  public async execute(
    request: UseCaseRequest
  ): Promise<Record<string, string>> {
    const {requestArgForFoo, requestArgForBar, requestArgForBaz} = request;

    return combinePromises({
      foo: this.foo.execute(requestArgForFoo),
      baz: ({bar, foo}: any) => this.baz.execute(requestArgForBaz, bar),
      bar: ({foo, baz}: any) => this.bar.execute(requestArgForBar, foo)
    });
  }
}
