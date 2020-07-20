/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';
import { PaymentMap } from '../../mapper/Payment';

import { RecordPaymentResponse } from './recordPaymentResponse';
import { RecordPaymentDTO } from './recordPaymentDTO';

export class RecordPaymentUsecase
  implements
    UseCase<
      RecordPaymentDTO,
      Promise<RecordPaymentResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      RecordPaymentDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  public async execute(
    payload: RecordPaymentDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<RecordPaymentResponse> {
    const paymentPayload = {
      invoiceId: payload.invoiceId,
      amount: payload.amount,
      payerId: payload.payerId,
      foreignPaymentId: payload.foreignPaymentId,
      paymentMethodId: payload.paymentMethodId,
      datePaid: payload.datePaid,
      markInvoiceAsPaid: !!payload.markInvoiceAsPaid,
    };

    try {
      const payment = PaymentMap.toDomain(paymentPayload);

      const invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(payload.invoiceId)).getValue()
      );

      // const invoiceTotal = invoice.getInvoiceTotal();

      // if (payment.amount.value < invoiceTotal) {
      //   return left(
      //     new RecordPaymentErrors.InvalidPaymentAmount(payload.amount)
      //   );
      // }

      if (payload.markInvoiceAsPaid) {
        invoice.markAsPaid(payment.paymentId);
      }

      await this.paymentRepo.save(payment);
      await this.invoiceRepo.update(invoice);

      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(Result.ok(payment));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
