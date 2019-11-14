import {FooUseCase} from './Foo';
import {BarUseCase} from './Bar';
import {BazUseCase} from './Baz';
import {ComboUseCase} from './X';

const foo = new FooUseCase();
const bar = new BarUseCase();
const baz = new BazUseCase();
const combo = new ComboUseCase(foo, bar, baz);

type Result = Record<string, string> | Error;

async function main() {
  const result: Result = await combo.execute({
    requestArgForFoo: 'foo',
    requestArgForBar: 'bar',
    requestArgForBaz: 'baz'
  });

  if (result.isLeft()) {
    switch()
    // handle the errors here
  }

  const {foo: fooResult, bar: barResult, baz: bazResult} = result;

  console.assert(
    fooResult === '[FooUseCase]: foo',
    'FooUseCase: Result not expected!'
  );
  console.assert(
    barResult === '[BarUseCase]: bar - [FooUseCase]: foo',
    'BarUseCase: Result not expected!'
  );
  console.assert(
    bazResult === '[BazUseCase]: baz - [BarUseCase]: bar - [FooUseCase]: foo',
    'BazUseCase: Result not expected!'
  );
}

main();
