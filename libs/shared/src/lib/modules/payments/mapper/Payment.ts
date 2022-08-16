import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Mapper } from '../../../infrastructure/Mapper';
import { Either } from '../../../core/logic/Either';
import { Amount } from '../../../domain/Amount';

import { ExternalOrderId } from '../domain/external-order-id';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PaymentMethodId } from '../domain/PaymentMethodId';
import { Payment, PaymentStatus } from '../domain/Payment';
import { PayerId } from '../../payers/domain/PayerId';

export class PaymentMap extends Mapper<Payment> {
  public static toDomain(raw: any): Either<GuardFailure, Payment> {
    const paymentOrError = Amount.create(raw.amount).chain((amount) =>
      Payment.create(
        {
          amount,
          payerId: raw.payerId
            ? PayerId.create(new UniqueEntityID(raw.payerId))
            : null,
          invoiceId: InvoiceId.create(new UniqueEntityID(raw.invoiceId)),
          paymentMethodId: PaymentMethodId.create(
            new UniqueEntityID(raw.paymentMethodId)
          ),
          foreignPaymentId: raw.foreignPaymentId
            ? ExternalOrderId.create(raw.foreignPaymentId)
            : null,
          datePaid: raw.datePaid ? new Date(raw.datePaid) : new Date(),
          status: raw.status ? raw.status : PaymentStatus.COMPLETED,
          paymentProof: raw.paymentProof
            ? ExternalOrderId.create(raw.paymentProof)
            : null,
          authorizationCode: raw.authorizationCode,
          cardLastDigits: raw.cardLastDigits,
        },
        new UniqueEntityID(raw.id)
      )
    );

    return paymentOrError;
  }

  public static toPersistence(payment: Payment): any {
    return {
      id: payment.id.toString(),
      invoiceId: payment.invoiceId.id.toString(),
      payerId: payment.payerId.id.toString(),
      paymentMethodId: payment.paymentMethodId.id.toString(),
      amount: payment.amount.value,
      datePaid: payment.datePaid,
      status: payment.status,
      foreignPaymentId: payment.foreignPaymentId?.toString(),
      paymentProof: payment.paymentProof?.toString(),
      authorizationCode: payment.authorizationCode,
      cardLastDigits: payment.cardLastDigits,
    };
  }
}
