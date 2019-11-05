import {Payment} from '../../domain/Payment';
import {PaymentRepoContract} from '../../repos/paymentRepo';
import {InvoiceRepoContract} from '../../../invoices/repos';
import {InvoiceId} from '../../../invoices/domain/InvoiceId';
import {UniqueEntityID} from 'libs/shared/src/lib/core/domain/UniqueEntityID';
import {Result} from 'libs/shared/src/lib/core/logic/Result';
import {Invoice} from '../../../invoices/domain/Invoice';
import {PayerId} from '../../../payers/domain/PayerId';
import {Amount} from 'libs/shared/src/lib/domain/Amount';
import {PaymentDone} from './../../domain/events/paymentDone';

interface PaypementPayload {
  amount: number;
  payerId: string;
  invoiceId: string;
  paymentMethod: string;
  foreignPaymentId: string;
}

export class RecordPayment {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private InvoiceRepo: InvoiceRepoContract
  ) {}

  public async execute(payload: PaypementPayload): Promise<Result<Invoice>> {
    const paymentPayload = {
      invoiceId: InvoiceId.create(
        new UniqueEntityID(payload.invoiceId)
      ).getValue(),
      foreignPaymentId: payload.foreignPaymentId,
      amount: Amount.create(payload.amount).getValue(),
      payerId: PayerId.create(new UniqueEntityID(payload.payerId))
    };

    const payment = Payment.create(paymentPayload).getValue();

    await this.paymentRepo.save(payment);

    const invoice = await this.InvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(payload.invoiceId)).getValue()
    );
    const invoiceTotal = invoice.getInvoiceTotal();

    if (payment.amount.value < invoiceTotal) {
      throw Result.fail(new Error('Invalid payment amount. not enuff moneyz'));
    }

    invoice.markAsPaid();
    await this.InvoiceRepo.update(invoice);

    return Result.ok(invoice);
  }
}
