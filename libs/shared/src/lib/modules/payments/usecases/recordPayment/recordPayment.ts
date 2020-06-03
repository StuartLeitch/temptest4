// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';
import { PayerId } from '../../../payers/domain/PayerId';
import { Amount } from '../../../../domain/Amount';
import { PaymentMap } from '../../mapper/Payment';

import { RecordPaymentResponse } from './recordPaymentResponse';
import { RecordPaymentErrors } from './recordPaymentErrors';
import { RecordPaymentDTO } from './recordPaymentDTO';

import { PaymentMethodId } from '../../domain/PaymentMethodId';

export type RecordPaymentContext = AuthorizationContext<Roles>;

export class RecordPaymentUsecase
  implements
    UseCase<
      RecordPaymentDTO,
      Promise<RecordPaymentResponse>,
      RecordPaymentContext
    >,
    AccessControlledUsecase<
      RecordPaymentDTO,
      RecordPaymentContext,
      AccessControlContext
    > {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  public async execute(
    payload: RecordPaymentDTO,
    context?: RecordPaymentContext
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
      const invoiceTotal = invoice.getInvoiceTotal();

      if (payment.amount.value < invoiceTotal) {
        return left(
          new RecordPaymentErrors.InvalidPaymentAmount(payload.amount)
        );
      }

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
