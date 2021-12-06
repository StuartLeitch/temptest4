/* eslint-disable @typescript-eslint/no-this-alias */
// * Core Domain
import { flattenEither, AsyncEither } from '../../../../core/logic/AsyncEither';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { AuditLoggerServiceContract } from '../../../../infrastructure/audit/AuditLoggerService';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * Usecase specific
import { PaymentStrategyFactory } from '../../domain/strategies/payment-strategy-factory';
import { PaymentStatus, PaymentTypes, Payment } from '../../domain/Payment';
import { PaymentStrategy } from '../../domain/strategies/payment-strategy';
import { InvoiceStatus } from '../../../invoices/domain/Invoice';
import { ExternalOrderId } from '../../domain/external-order-id';
import { PaymentDTO } from '../../domain/strategies/behaviors';

import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { PaymentRepoContract } from '../../repos';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
} from '../../../invoices/repos';

import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetPaymentsByInvoiceIdUsecase } from '../getPaymentsByInvoiceId';
import { CreatePaymentUsecase } from '../createPayment';
import { GetPaymentMethodByIdUsecase } from '../getPaymentMethodById';
import { PaymentMethodRepoContract } from '../../repos';

import {
  WithExistingPayments,
  WithPaymentMethodId,
  WithPaymentDetails,
  SelectionData,
  UpdatePayment,
  WithInvoiceId,
  PaymentData,
  WithInvoice,
} from './helper-types';

import { RecordPaymentResponse as Response } from './recordPaymentResponse';
import type { RecordPaymentDTO as DTO } from './recordPaymentDTO';
import * as Errors from './recordPaymentErrors';

export type Context = UsecaseAuthorizationContext & {
  paymentType: PaymentTypes;
};

export class RecordPaymentUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private strategyFactory: PaymentStrategyFactory,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private paymentRepo: PaymentRepoContract,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private logger: LoggerContract,
    private auditLoggerService: AuditLoggerServiceContract
  ) {
    super();
    this.attachExistingPayments = this.attachExistingPayments.bind(this);
    this.attachPaymentIfExists = this.attachPaymentIfExists.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.attachManuscript = this.attachManuscript.bind(this);
    this.shouldPayInvoice = this.shouldPayInvoice.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.attachStrategy = this.attachStrategy.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.updatePayment = this.updatePayment.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
    this.savePayment = this.savePayment.bind(this);
    this.pay = this.pay.bind(this);
  }

  async getAccessControlContext(r: DTO, c: Context) {
    return {
      paymentType: c.paymentType,
    } as any;
  }

  @Authorize('payment:register')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const result = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachInvoice(context))
        .then(this.attachInvoiceItems(context))
        .then(this.attachExistingPayments(context))
        .then(this.shouldPayInvoice)
        .then(this.attachPayer(context))
        .then(this.attachManuscript(context))
        .then(this.attachStrategy)
        .then(this.pay)
        .then(this.savePayment(context))
        .map((data) => data.payment)
        .execute();
      return result as Response;
    } catch (e) {
      return left(this.newUnexpectedError(e, request.invoiceId));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<Either<Errors.InvoiceIdRequiredError, T>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    if (!request.datePaid) {
      return left(new Errors.PaymentDateRequiredError());
    }

    return right(request);
  }

  private attachInvoice(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((invoice) => ({
          ...request,
          invoice,
        }))
        .execute();
    };
  }

  private attachInvoiceItems(context: Context) {
    return async <T extends WithInvoice>(request: T) => {
      const usecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );

      return new AsyncEither(request.invoice.id.toString())
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((items) => {
          request.invoice.addItems(items);
          return { ...request, invoiceItems: items };
        })
        .execute();
    };
  }

  private attachExistingPayments(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetPaymentsByInvoiceIdUsecase(
        this.invoiceRepo,
        this.paymentRepo
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((existingPayments) => ({ ...request, existingPayments }))
        .execute();
    };
  }

  private async shouldPayInvoice<T extends WithExistingPayments>(
    request: T
  ): Promise<
    Either<
      | Errors.InvoiceCannotBePaidError
      | Errors.InvoiceAlreadyPaidError
      | Errors.PaymentPendingError,
      T
    >
  > {
    const { existingPayments, invoiceItems, invoice } = request;
    const invoiceId = invoice.id.toString();

    if (invoice.status === InvoiceStatus.DRAFT) {
      return left(new Errors.InvoiceCannotBePaidError(invoiceId));
    }

    if (invoice.status !== InvoiceStatus.ACTIVE) {
      return left(
        new Errors.InvoiceAlreadyPaidError(invoice.persistentReferenceNumber)
      );
    }

    if (existingPayments.some((p) => p.status === PaymentStatus.PENDING)) {
      return left(new Errors.PaymentPendingError(invoiceId));
    }

    const paidTotal = existingPayments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount.value, 0);

    if (paidTotal >= invoice.invoiceTotal) {
      return left(
        new Errors.InvoiceAlreadyPaidError(invoice.persistentReferenceNumber)
      );
    }

    return right(request);
  }

  private attachPayer(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.logger
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((payer) => ({ ...request, payer }))
        .execute();
    };
  }

  private attachManuscript(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((manuscripts) => manuscripts[0])
        .map((manuscript) => ({ ...request, manuscript }))
        .execute();
    };
  }

  private async attachStrategy<T extends SelectionData>(
    request: T
  ): Promise<Either<null, T & { strategy: PaymentStrategy }>> {
    const { payerIdentification, paymentReference } = request;

    const strategy = await this.strategyFactory.selectStrategy({
      payerIdentification,
      paymentReference,
    });

    return right({
      ...request,
      strategy,
    });
  }

  private async pay<T extends PaymentData>(request: T) {
    const {
      payerIdentification,
      paymentReference,
      manuscript,
      strategy,
      invoice,
    } = request;
    const makePaymentData: PaymentDTO = {
      netAmountBeforeDiscount: invoice.netTotalBeforeDiscount,
      invoiceReferenceNumber: invoice.persistentReferenceNumber,
      discountAmount: invoice.invoiceDiscountTotal,
      manuscriptCustomId: manuscript.customId,
      invoiceTotal: invoice.invoiceTotal,
      netAmount: invoice.invoiceNetTotal,
      vatAmount: invoice.invoiceVatTotal,
      invoiceId: invoice.id.toString(),
      payerIdentification,
      paymentReference,
    };

    return new AsyncEither(makePaymentData)
      .then((data) => strategy.makePayment(data))
      .map((paymentDetails) => ({ ...request, paymentDetails }))
      .execute();
  }

  private attachPaymentIfExists(context: Context) {
    const usecase = new GetPaymentsByInvoiceIdUsecase(
      this.invoiceRepo,
      this.paymentRepo
    );

    return async <T extends WithInvoiceId & WithPaymentMethodId>(
      request: T
    ) => {
      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => result)
        .map((payments) => {
          return payments
            .filter((payment) => payment.status === PaymentStatus.CREATED)
            .filter(
              (payment) =>
                payment.paymentMethodId.toString() === request.paymentMethodId
            );
        })
        .map((payments) => {
          if (payments.length === 0) {
            return null;
          } else {
            return payments[0];
          }
        })
        .map((existingPayment) => ({
          ...request,
          existingPayment,
        }))
        .execute();
    };
  }

  private async updatePayment<T extends UpdatePayment>(
    request: T
  ): Promise<Either<Errors.PaymentUpdateDbError | UnexpectedError, Payment>> {
    try {
      if (request.paymentDetails.status !== request.payment.status) {
        request.payment.status = request.paymentDetails.status;
      }

      const maybeUpdated = await this.paymentRepo.updatePayment(
        request.payment
      );

      if (maybeUpdated.isLeft()) {
        return left(new UnexpectedError(new Error(maybeUpdated.value.message)));
      }

      const updated = maybeUpdated.value;

      if (updated.status === PaymentStatus.COMPLETED) {
        updated.addCompletedEvent(request.isFinalPayment);
      }
      DomainEvents.dispatchEventsForAggregate(updated.id);
      return right(updated);
    } catch (err) {
      return left(
        new Errors.PaymentUpdateDbError(
          request.payment.invoiceId.toString(),
          err
        )
      );
    }
  }

  private savePayment(context: Context) {

    const _self = this;

    return async <T extends WithPaymentDetails>(request: T) => {
      const usecaseSave = new CreatePaymentUsecase(this.paymentRepo);
      const getPaymentMethodById = new GetPaymentMethodByIdUsecase(this.paymentMethodRepo);
      const { paymentDetails, datePaid, invoice, amount, payer } = request;

      const dto = {
        foreignPaymentId: paymentDetails.foreignPaymentId.id.trim(),
        paymentMethodId: paymentDetails.paymentMethodId.toString(),
        isFinalPayment: request.isFinalPayment ?? true,
        amount: amount ?? invoice.invoiceTotal,
        paymentDetails: request.paymentDetails,
        invoiceId: invoice.id.toString(),
        status: paymentDetails.status,
        payerId: payer.id.toString(),
        datePaid,
      };

      const maybeWithPayment = new AsyncEither(dto).then(
        this.attachPaymentIfExists(context)
      );

      const maybeCreateNewPayment = await maybeWithPayment
        .advanceOrEnd(async (data) => {
          if (data.existingPayment) {
            return right(false);
          }

          return right(true);
        })
        .then((data) => usecaseSave.execute(data, context))
        .map((payment) => ({ ...request, payment }))
        .execute();

      const maybePaymentMethod = await getPaymentMethodById.execute({ paymentMethodId: dto.paymentMethodId} , context);

      const maybeUpdatePayment = await maybeWithPayment
        .advanceOrEnd(async (data) => {
          if (data.existingPayment) {
            return right(true);
          }
          return right(false);
        })
        .map((request) => {
          const { existingPayment, foreignPaymentId } = request;
          existingPayment.foreignPaymentId = ExternalOrderId.create(
            foreignPaymentId
          );

          return { ...request, payment: existingPayment };
        })
        .then(this.updatePayment)
        .map((payment) => ({ ...request, payment }))
        .execute();

      return flattenEither([maybeCreateNewPayment, maybeUpdatePayment]).map(
        ([saveValue, updateValue]) => {

          // * Save the payment in audit log
          if (maybePaymentMethod.isRight) {
            // ! Should only log for Bank Transfers
            if ((maybePaymentMethod.value as any).name === 'Bank Transfer') {
              _self.auditLoggerService.log({
                action: 'has added',
                entity: 'payment',
                item_reference: saveValue.payment.foreignPaymentId.value.id.toString(),
                target: `Invoice #${request.invoice.id.toString()}`,
                timestamp: new Date(),
              });
            }
          }


          if (saveValue.payment) {
            return saveValue;
          }
          return updateValue;
        }
      );
    };
  }

  private newUnexpectedError(e: Error, id: string): UnexpectedError {
    return new UnexpectedError(
      e,
      `Recording payment for invoice with id {${id}}`
    );
  }
}
