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

import { PaymentDone } from '../../domain/events/paymentDone';
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
      invoiceId: InvoiceId.create(
        new UniqueEntityID(payload.invoiceId)
      ).getValue(),
      amount: Amount.create(payload.amount).getValue(),
      payerId: PayerId.create(new UniqueEntityID(payload.payerId)),
      foreignPaymentId: payload.foreignPaymentId,
      paymentMethodId: PaymentMethodId.create(
        new UniqueEntityID(payload.paymentMethodId)
      )
    };

    try {
      const payment = Payment.create(paymentPayload).getValue();

      await this.paymentRepo.save(payment);

      const invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(payload.invoiceId)).getValue()
      );
      const invoiceTotal = invoice.getInvoiceTotal();

      if (payment.amount.value < invoiceTotal) {
        return left(
          new RecordPaymentErrors.InvalidPaymentAmount(payload.amount)
        );
      }

      invoice.markAsPaid();
      await this.invoiceRepo.update(invoice);

      return right(Result.ok(invoice));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
