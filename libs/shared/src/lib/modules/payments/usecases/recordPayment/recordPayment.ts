/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, left, right } from '../../../../core/logic/Either';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext as Context,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { PaymentRepoContract } from '../../repos';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
} from '../../../invoices/repos';

import { Invoice } from '../../../invoices/domain/Invoice';

import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';

import { PaymentStrategyFactory } from '../../domain/strategies/payment-strategy-factory';

import { RecordPaymentResponse as Response } from './recordPaymentResponse';
import { RecordPaymentDTO as DTO } from './recordPaymentDTO';
import * as Errors from './recordPaymentErrors';

interface WithInvoiceId {
  invoiceId: string;
}

interface WithInvoice {
  invoice: Invoice;
}

export class RecordPaymentUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private strategyFactory: PaymentStrategyFactory,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private logger: LoggerContract
  ) {
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachInvoice(context))
        .then(this.attachInvoiceItems(context))
        .then(this.attachPayer(context))
        .execute();

      return null;
      return execution;
    } catch (e) {
      return left(this.newUnexpectedError(e, request.invoiceId));
    }
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<
    Either<
      Errors.PayerIdentificationRequiredError | Errors.InvoiceIdRequiredError,
      T
    >
  > {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }
    if (!request.payerIdentification) {
      return left(new Errors.PayerIdentificationRequiredError());
    }

    return right(request);
  }

  private attachInvoice(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => result.getValue())
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
        .map((result) => result.getValue())
        .map((items) => {
          request.invoice.addItems(items);
          return request;
        })
        .execute();
    };
  }

  private attachPayer(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.logger
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => result.getValue())
        .map((payer) => ({ ...request, payer }))
        .execute();
    };
  }

  private newUnexpectedError(e: Error, id: string): AppError.UnexpectedError {
    return new AppError.UnexpectedError(
      e,
      `Recording payment for invoice with id {${id}}`
    );
  }
}
