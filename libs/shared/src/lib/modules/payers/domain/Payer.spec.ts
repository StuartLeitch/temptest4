import {Result} from '../../../core/logic/Result';

import {Payer} from './Payer';
import {PayerName} from './PayerName';
import {PayerType} from './PayerType';

let payerOrError: Result<Payer>;
// let payer: Payer;

describe('Payer', () => {
  beforeEach(() => {
    // payer = null;
    payerOrError = null;
  });

  it('Should be able to be created', () => {
    payerOrError = Payer.create({
      name: PayerName.create('Foo').getValue(),
      surname: PayerName.create('Bar').getValue(),
      type: PayerType.create('FooBar').getValue()
    });

    expect(payerOrError.isSuccess).toBeTruthy();
  });
});
