import {Result} from '../../../core/logic/Result';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Amount} from '../../../domain/Amount';

import {InvoiceId} from '../../invoices/domain/InvoiceId';
import {PayerId} from '../../payers/domain/PayerId';
import {Payment} from './Payment';

let paymentOrError: Result<Payment>;

describe('Payment', () => {
  beforeEach(() => {
    paymentOrError = null;
  });

  it('Should be able to be created', () => {
    paymentOrError = Payment.create({
      invoiceId: InvoiceId.create(new UniqueEntityID('test-invoice')),
      payerId: PayerId.create(new UniqueEntityID('test-payer')),
      amount: Amount.create(100).getValue()
    });

    expect(paymentOrError.isSuccess).toBeTruthy();
  });
});
