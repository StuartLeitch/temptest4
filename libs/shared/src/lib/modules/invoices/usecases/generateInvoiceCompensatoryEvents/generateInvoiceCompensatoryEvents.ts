// * Core Domain
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { WaiverAssignedCollection } from '../../../waivers/domain/WaiverAssignedCollection';
import { CouponAssignedCollection } from '../../../coupons/domain/CouponAssignedCollection';
import { InvoiceStatus } from '../../domain/Invoice';
import { Invoice } from '../../domain/Invoice';

import { PaymentMethodRepoContract } from '../../../payments/repos/paymentMethodRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../../payments/repos/paymentRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetPaymentsByInvoiceIdUsecase } from '../../../payments/usecases/getPaymentsByInvoiceId';
import { GetPaymentMethodsUseCase } from '../../../payments/usecases/getPaymentMethods';
import { GetAddressUsecase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import {
  PublishInvoiceConfirmedUsecase,
  PublishInvoiceConfirmedDTO,
} from '../publishEvents/publishInvoiceConfirmed';
import {
  PublishInvoiceCreditedUsecase,
  PublishInvoiceCreditedDTO,
} from '../publishEvents/publishInvoiceCredited';
import {
  PublishInvoiceFinalizedUsecase,
  PublishInvoiceFinalizedDTO,
} from '../publishEvents/publishInvoiceFinalized';
import {
  PublishInvoicePaidUsecase,
  PublishInvoicePaidDTO,
} from '../publishEvents/publishInvoicePaid';
import {
  PublishInvoiceCreatedUsecase,
  PublishInvoiceCreatedDTO,
} from '../publishEvents/publishInvoiceCreated';

// * Usecase specific
import { GenerateInvoiceCompensatoryEventsResponse as Response } from './generateInvoiceCompensatoryEventsResponse';
import type { GenerateInvoiceCompensatoryEventsDTO as DTO } from './generateInvoiceCompensatoryEventsDTO';
import * as Errors from './generateInvoiceCompensatoryEventsErrors';

import {
  InvoiceConfirmedData,
  InvoiceFinalizedData,
  InvoiceCreditedData,
  InvoiceCreatedData,
  WithBillingAddress,
  InvoicePayedData,
  WithInvoiceItems,
  WithInvoiceId,
  WithPayments,
  WithInvoice,
  WithPayer,
} from './actionTypes';

function originalInvoiceId(invoice: Invoice): string {
  return invoice.id.toString();
}

export class GenerateInvoiceCompensatoryEventsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private sqsPublish: SQSPublishServiceContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract
  ) {
    super();
    this.publishInvoiceConfirmed = this.publishInvoiceConfirmed.bind(this);
    this.publishInvoiceFinalized = this.publishInvoiceFinalized.bind(this);
    this.removeCouponsAndWaivers = this.removeCouponsAndWaivers.bind(this);
    this.publishInvoiceCreated = this.publishInvoiceCreated.bind(this);
    this.attachPaymentMethods = this.attachPaymentMethods.bind(this);
    this.havePaymentsBeenMade = this.havePaymentsBeenMade.bind(this);
    this.publishInvoicePayed = this.publishInvoicePayed.bind(this);
    this.shouldSendConfirmed = this.shouldSendConfirmed.bind(this);
    this.updateInvoiceStatus = this.updateInvoiceStatus.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.sendConfirmedEvent = this.sendConfirmedEvent.bind(this);
    this.sendFinalizedEvent = this.sendFinalizedEvent.bind(this);
    this.shouldSendFinalize = this.shouldSendFinalize.bind(this);
    this.attachPaymentDate = this.attachPaymentDate.bind(this);
    this.shouldSendCreated = this.shouldSendCreated.bind(this);
    this.attachManuscript = this.attachManuscript.bind(this);
    this.sendCreatedEvent = this.sendCreatedEvent.bind(this);
    this.shouldSendPayed = this.shouldSendPayed.bind(this);
    this.attachPayments = this.attachPayments.bind(this);
    this.sendPayedEvent = this.sendPayedEvent.bind(this);
    this.attachAddress = this.attachAddress.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
  }

  @Authorize('invoice:generateCompensatoryEvents')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither<null, DTO>(request)
        .then(this.verifyInput)
        .then(this.publishInvoiceCreated(context))
        .then(this.publishInvoiceConfirmed(context))
        .then(this.publishInvoicePayed(context))
        .then(this.publishInvoiceFinalized(context))
        .map((): void => null)
        .execute();
      return execution as Response;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async verifyInput(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequiredError, DTO>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
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
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );
      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((invoiceItems) => ({
          ...request,
          invoiceItems,
        }))
        .execute();
    };
  }

  private attachManuscript(context: Context) {
    return async <T extends WithInvoice>(request: T) => {
      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const id = originalInvoiceId(request.invoice);

      return new AsyncEither(id)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          manuscript: result[0],
        }))
        .execute();
    };
  }

  private attachPayer(context: Context) {
    return async <T extends WithInvoice>(request: T) => {
      const usecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );
      const id = originalInvoiceId(request.invoice);

      return new AsyncEither(id)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((payer) => ({
          ...request,
          payer,
        }))
        .execute();
    };
  }

  private attachAddress(context: Context) {
    return async <T extends WithPayer>(request: T) => {
      const usecase = new GetAddressUsecase(this.addressRepo);

      if (!request.payer) {
        return right<null, T & WithBillingAddress>({
          ...request,
          billingAddress: null,
        });
      }

      return new AsyncEither(request.payer.billingAddressId.id.toString())
        .then((billingAddressId) =>
          usecase.execute({ billingAddressId }, context)
        )
        .map((result) => ({
          ...request,
          billingAddress: result,
        }))
        .execute();
    };
  }

  private attachPayments(context: Context) {
    return async <T extends WithInvoice>(request: T) => {
      const usecase = new GetPaymentsByInvoiceIdUsecase(
        this.invoiceRepo,
        this.paymentRepo
      );
      const id = originalInvoiceId(request.invoice);

      return new AsyncEither(id)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          payments: result,
        }))
        .execute();
    };
  }

  private attachPaymentMethods(context: Context) {
    return async <T extends Record<string, any>>(request: T) => {
      const usecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );

      return new AsyncEither(null)
        .then(() => usecase.execute(null, context))
        .map((paymentMethods) => ({ ...request, paymentMethods }))
        .execute();
    };
  }

  private async shouldSendCreated<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (!invoice.dateAccepted) {
      return right(false);
    }

    return right(true);
  }

  private async shouldSendConfirmed<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (
      invoice.status === InvoiceStatus.PENDING ||
      invoice.status === InvoiceStatus.DRAFT ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return right(false);
    }
    return right(true);
  }

  private async shouldSendPayed<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (
      invoice.status !== InvoiceStatus.FINAL ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return right(false);
    }
    return right(true);
  }

  private async shouldSendFinalize<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (
      invoice.status !== InvoiceStatus.FINAL ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return right(false);
    }
    return right(true);
  }

  private async havePaymentsBeenMade<T extends WithPayer & WithPayments>({
    payments,
    payer,
  }: T): Promise<Either<null, boolean>> {
    if (!payer) {
      return right(false);
    }

    if (!payments || payments.length === 0) {
      return right(false);
    }

    return right(true);
  }

  private attachPaymentDate(context: Context) {
    return <T extends WithInvoice & WithPayments>(request: T) => {
      const { payments, invoice } = request;
      let paymentDate: Date;

      if (payments.length === 0) {
        paymentDate = invoice.dateIssued;
      } else {
        paymentDate = payments.reduce(
          (acc, payment) => (acc < payment.datePaid ? payment.datePaid : acc),
          new Date(0)
        );
      }

      return {
        ...request,
        paymentDate,
      };
    };
  }

  private removeCouponsAndWaivers<T extends WithInvoiceItems>(request: T) {
    const invoiceItems = request.invoiceItems.map((item) => {
      item.props.assignedWaivers = WaiverAssignedCollection.create();
      item.props.assignedCoupons = CouponAssignedCollection.create();
      return item;
    });
    return {
      ...request,
      invoiceItems,
    };
  }

  private sendCreatedEvent(context: Context) {
    return async <T extends InvoiceCreatedData>(request: T) => {
      const publishUsecase = new PublishInvoiceCreatedUsecase(this.sqsPublish);
      const data: PublishInvoiceCreatedDTO = {
        ...request,
        messageTimestamp: request.invoice.dateAccepted,
      };
      return publishUsecase.execute(data, context);
    };
  }

  private sendConfirmedEvent(context: Context) {
    return async <T extends InvoiceConfirmedData>(request: T) => {
      const publishUsecase = new PublishInvoiceConfirmedUsecase(
        this.sqsPublish
      );
      const data: PublishInvoiceConfirmedDTO = {
        ...request,
        messageTimestamp: request.invoice.dateIssued,
      };
      return publishUsecase.execute(data, context);
    };
  }

  private sendPayedEvent(context: Context) {
    return async <T extends InvoicePayedData>(request: T) => {
      const publishUsecase = new PublishInvoicePaidUsecase(this.sqsPublish);
      const data: PublishInvoicePaidDTO = {
        ...request,
        messageTimestamp: request.paymentDate,
      };
      return publishUsecase.execute(data, context);
    };
  }

  private sendFinalizedEvent(context: Context) {
    return async <T extends InvoiceFinalizedData>(request: T) => {
      const publishUsecase = new PublishInvoiceFinalizedUsecase(
        this.sqsPublish
      );
      const data: PublishInvoiceFinalizedDTO = {
        ...request,
        messageTimestamp: request.invoice.dateMovedToFinal,
      };
      return publishUsecase.execute(data, context);
    };
  }

  private updateInvoiceStatus(
    status: keyof typeof InvoiceStatus,
    useDate: string,
    useInvoice = true
  ) {
    return <T extends WithInvoice>(request: T) => {
      const { invoice } = request;

      invoice.status = InvoiceStatus[status];

      return {
        ...request,
        invoice,
      };
    };
  }

  private publishInvoiceCreated(context: Context) {
    return async (request: DTO) => {
      return new AsyncEither<null, DTO>(request)
        .then(this.attachInvoice(context))
        .advanceOrEnd(this.shouldSendCreated)
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .map(this.updateInvoiceStatus('DRAFT', 'dateAccepted'))
        .map(this.removeCouponsAndWaivers)
        .then(this.sendCreatedEvent(context))
        .map(() => request)
        .execute();
    };
  }

  private publishInvoiceConfirmed(context: Context) {
    return async (request: DTO) => {
      return new AsyncEither<null, DTO>(request)
        .then(this.attachInvoice(context))
        .advanceOrEnd(this.shouldSendConfirmed)
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .then(this.attachPayer(context))
        .then(this.attachAddress(context))
        .map(this.updateInvoiceStatus('ACTIVE', 'dateIssued'))
        .then(this.sendConfirmedEvent(context))
        .map(() => request)
        .execute();
    };
  }

  private publishInvoicePayed(context: Context) {
    return async (request: DTO) => {
      return new AsyncEither<null, DTO>(request)
        .then(this.attachInvoice(context))
        .advanceOrEnd(this.shouldSendPayed)
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .then(this.attachPayer(context))
        .then(this.attachAddress(context))
        .then(this.attachPayments(context))
        .advanceOrEnd(this.havePaymentsBeenMade)
        .then(this.attachPaymentMethods(context))
        .map(this.attachPaymentDate(context))
        .then(this.sendPayedEvent(context))
        .map(() => request)
        .execute();
    };
  }

  private publishInvoiceFinalized(context: Context) {
    return async (request: DTO) => {
      return new AsyncEither<null, DTO>(request)
        .then(this.attachInvoice(context))
        .advanceOrEnd(this.shouldSendFinalize)
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .then(this.attachPayer(context))
        .then(this.attachAddress(context))
        .then(this.attachPayments(context))
        .then(this.attachPaymentMethods(context))
        .then(this.sendFinalizedEvent(context))
        .map(() => request)
        .execute();
    };
  }
}
