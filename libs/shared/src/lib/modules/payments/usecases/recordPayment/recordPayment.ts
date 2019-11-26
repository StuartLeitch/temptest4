import { BraintreeGateway } from '@hindawi/shared';
// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';
import { PayerId } from '../../../payers/domain/PayerId';
import { Amount } from '../../../../domain/Amount';
import { Payment } from '../../domain/Payment';

import { RecordPaymentResponse } from './recordPaymentResponse';
import { RecordPaymentErrors } from './recordPaymentErrors';
import { RecordPaymentDTO } from './recordPaymentDTO';

import { PaymentMethodId } from '../../domain/PaymentMethodId';
import { DomainEvents } from 'libs/shared/src/lib/core/domain/events/DomainEvents';

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
      invoiceId: InvoiceId.create(
        new UniqueEntityID(payload.invoiceId)
      ).getValue(),
      amount: Amount.create(payload.amount).getValue(),
      payerId: PayerId.create(new UniqueEntityID(payload.payerId)),
      foreignPaymentId: payload.foreignPaymentId,
      paymentMethodId: PaymentMethodId.create(
        new UniqueEntityID(payload.paymentMethodId)
      ),
      datePaid: payload.datePaid ? new Date(payload.datePaid) : new Date()
    };

    try {
      const payment = Payment.create(paymentPayload).getValue();

      const invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(payload.invoiceId)).getValue()
      );
      const invoiceTotal = invoice.getInvoiceTotal();

      if (payment.amount.value < invoiceTotal) {
        return left(
          new RecordPaymentErrors.InvalidPaymentAmount(payload.amount)
        );
      }

      invoice.markAsPaid(payment.paymentId);

      await this.paymentRepo.save(payment);
      await this.invoiceRepo.update(invoice);

      DomainEvents.dispatchEventsForAggregate(invoice.id);
      
      return right(Result.ok(payment));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
