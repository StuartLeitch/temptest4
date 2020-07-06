import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Amount } from '../../../domain/Amount';

import { Payment, PaymentStatus } from '../domain/Payment';
import { PaymentMethodId } from '../domain/PaymentMethodId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PaymentProof } from '../domain/payment-proof';
import { PayerId } from '../../payers/domain/PayerId';

export class PaymentMap extends Mapper<Payment> {
  public static toDomain(raw: any): Payment {
    const invoiceOrError = Payment.create(
      {
        payerId: raw.payerId
          ? PayerId.create(new UniqueEntityID(raw.payerId))
          : null,
        invoiceId: InvoiceId.create(
          new UniqueEntityID(raw.invoiceId)
        ).getValue(),
        amount: Amount.create(raw.amount).getValue(),
        paymentMethodId: PaymentMethodId.create(
          new UniqueEntityID(raw.paymentMethodId)
        ),
        foreignPaymentId: raw.foreignPaymentId,
        datePaid: raw.datePaid ? new Date(raw.datePaid) : new Date(),
        status: raw.status ? raw.status : PaymentStatus.COMPLETED,
        paymentProof: raw.paymentProof
          ? PaymentProof.create(raw.paymentProof)
          : null,
      },
      new UniqueEntityID(raw.id)
    );

    invoiceOrError.isFailure ? console.log(invoiceOrError) : '';

    return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
  }

  public static toPersistence(payment: Payment): any {
    return {
      id: payment.id.toString(),
      invoiceId: payment.invoiceId.id.toString(),
      payerId: payment.payerId.id.toString(),
      paymentMethodId: payment.paymentMethodId.id.toString(),
      amount: payment.amount.value,
      datePaid: payment.datePaid,
      foreignPaymentId: payment.foreignPaymentId,
      status: payment.status,
      paymentProof: payment.paymentProof?.toString(),
    };
  }
}
