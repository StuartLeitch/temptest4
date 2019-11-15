import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

import { Payer, PayerType } from './Payer';
import { PayerName } from './PayerName';
import { InvoiceId } from './../../invoices/domain/InvoiceId';
import { AddressId } from './../../addresses/domain/AddressId';

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
      billingAddressId: AddressId.create(new UniqueEntityID('address-foo-id')),
      name: PayerName.create('Foo').getValue(),
      type: PayerType.INSTITUTION
    });

    expect(payerOrError.isSuccess).toBeTruthy();
  });
});
