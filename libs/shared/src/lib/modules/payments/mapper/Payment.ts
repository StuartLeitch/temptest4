import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Payment } from '../domain/Payment';
import { PaymentMethodId } from '../domain/PaymentMethodId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PayerId } from '../../payers/domain/PayerId';
import { Amount } from '../../../domain/Amount';
// import {FilePersistenceDTO} from '../../../infrastructure/mapper/File';

// export interface PaymentPersistenceDTO {
//   id: string;
//   payerId: string;
//   invoiceId: string;
//   amount: number;
//   paymentMethodId: string;
//   foreignPaymentId: string;
//   datePaid: Date;
//   paymentProof?: FilePersistenceDTO;
// }

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
        datePaid: raw.datePaid ? new Date(raw.datePaid) : new Date()
        //  paymentProof: FileMap.toDomain(raw.paymentProof)
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
      foreignPaymentId: payment.foreignPaymentId
      // paymentProof: FileMap.toPersistence(payment.paymentProof)
    };
  }
}
