import { Result } from '../../../core/logic/Result';

import { Payer, PayerType } from './Payer';
import { PayerName } from './PayerName';
import { InvoiceId } from './../../invoices/domain/InvoiceId';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';

let payerOrError: Result<Payer>;
// let payer: Payer;

describe('Payer', () => {
  beforeEach(() => {
    // payer = null;
    payerOrError = null;
  });

  it('Should be able to be created', () => {
    payerOrError = Payer.create({
      invoiceId: InvoiceId.create(
        new UniqueEntityID('invoice-foo-id')
      ).getValue(),
      name: PayerName.create('Foo').getValue(),
      type: PayerType.INSTITUTION
    });

    expect(payerOrError.isSuccess).toBeTruthy();
  });
});
