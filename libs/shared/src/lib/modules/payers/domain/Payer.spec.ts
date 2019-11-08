import {Result} from '../../../core/logic/Result';

import {Payer, PayerType} from './Payer';
import {PayerName} from './PayerName';

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
      type: PayerType.INSTITUTION
    });

    expect(payerOrError.isSuccess).toBeTruthy();
  });
});
