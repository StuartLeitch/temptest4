// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { Payment } from '../../../payments/domain/Payment';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceStatus } from '../../domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';
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
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { PublishInvoiceConfirmed } from '../publishEvents/publishInvoiceConfirmed';
import { PublishInvoiceCredited } from '../publishEvents/publishInvoiceCredited';
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
import { GenerateCompensatoryEventsResponse as Response } from './generateCompensatoryEventsResponse';
import { GenerateCompensatoryEventsDTO as DTO } from './generateCompensatoryEventsDTO';
import * as Errors from './generateCompensatoryEventsErrors';

type Context = AuthorizationContext<Roles>;
export type GenerateCompensatoryEventsContext = Context;

interface WithInvoice {
  invoice: Invoice;
}

interface WithInvoiceId {
  invoiceId: string;
}

interface InvoiceConfirmedData {
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  invoice: Invoice;
  payer: Payer;
}

interface InvoiceCreatedData {
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  invoice: Invoice;
}

interface InvoicePayedData {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  payments: Payment[];
  paymentDate: Date;
  invoice: Invoice;
  payer: Payer;
}

interface InvoiceFinalizedData {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  payments: Payment[];
  invoice: Invoice;
  payer: Payer;
}

interface InvoiceCreditedData {
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  invoice: Invoice;
  payer: Payer;
}

export class GenerateCompensatoryEventsUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
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
    this.publishInvoiceConfirmed = this.publishInvoiceConfirmed.bind(this);
    this.publishInvoiceCreated = this.publishInvoiceCreated.bind(this);
    this.publishInvoicePayed = this.publishInvoicePayed.bind(this);
    this.shouldSendConfirmed = this.shouldSendConfirmed.bind(this);
    this.updateInvoiceStatus = this.updateInvoiceStatus.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.sendConfirmedEvent = this.sendConfirmedEvent.bind(this);
    this.attachPaymentDate = this.attachPaymentDate.bind(this);
    this.shouldSendCreated = this.shouldSendCreated.bind(this);
    this.attachManuscript = this.attachManuscript.bind(this);
    this.sendCreatedEvent = this.sendCreatedEvent.bind(this);
    this.shouldSendPayed = this.shouldSendPayed.bind(this);
    this.sendPayedEvent = this.sendPayedEvent.bind(this);
    this.attachAddress = this.attachAddress.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
    this.shouldSendFinalize = this.shouldSendFinalize.bind(this);
    this.publishInvoiceFinalized = this.publishInvoiceFinalized.bind(this);
    this.sendFinalizedEvent = this.sendFinalizedEvent.bind(this);
    this.attachPayments = this.attachPayments.bind(this);
    this.publishInvoiceCredited = this.publishInvoiceCredited.bind(this);
    this.shouldSendCredited = this.shouldSendCredited.bind(this);
    this.attachPaymentMethods = this.attachPaymentMethods.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const requestExecution = new AsyncEither<null, DTO>(request)
      .then(this.verifyInput)
      .then(this.publishInvoiceCreated(context))
      .then(this.publishInvoiceConfirmed(context))
      .then(this.publishInvoicePayed(context))
      .then(this.publishInvoiceCredited(context))
      .then(this.publishInvoiceFinalized(context))
      .map(() => Result.ok<void>(null));

    return requestExecution.execute();
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
        .map((result) => ({
          ...request,
          invoice: result.getValue(),
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
        .map((result) => ({
          ...request,
          invoiceItems: result.getValue(),
        }))
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
        .map((result) => ({
          ...request,
          manuscript: result.getValue()[0],
        }))
        .execute();
    };
  }

  private attachPayer(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          payer: result.getValue(),
        }))
        .execute();
    };
  }

  private attachAddress(context: Context) {
    return async <T extends { payer: Payer }>(request: T) => {
      const usecase = new GetAddressUseCase(this.addressRepo);

      if (!request.payer) {
        return right<null, T & { billingAddress: Address }>({
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
          billingAddress: result.getValue(),
        }))
        .execute();
    };
  }

  private attachPayments(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetPaymentsByInvoiceIdUsecase(
        this.invoiceRepo,
        this.paymentRepo
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          payments: result.getValue(),
        }))
        .execute();
    };
  }

  private attachPaymentMethods(context: Context) {
    return async <T extends {}>(request: T) => {
      const usecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );

      return new AsyncEither(null)
        .then(() => usecase.execute(null, context))
        .map((result) => ({ ...request, paymentMethods: result.getValue() }))
        .execute();
    };
  }

  private async shouldSendCreated<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (invoice.cancelledInvoiceReference) {
      return right(false);
    }

    if (!invoice.dateAccepted) {
      return right(false);
    }

    return right(true);
  }

  private async shouldSendConfirmed<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (invoice.cancelledInvoiceReference) {
      return right(false);
    }

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
    if (invoice.cancelledInvoiceReference) {
      return right(false);
    }

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

  private async shouldSendCredited<T extends WithInvoice>({
    invoice,
  }: T): Promise<Either<null, boolean>> {
    if (!invoice.cancelledInvoiceReference) {
      return right(false);
    }

    return right(true);
  }

  private attachPaymentDate(context: Context) {
    return <T extends WithInvoice & { payments: Payment[] }>(request: T) => {
      const { payments, invoice } = request;
      let paymentDate: Date;

      if (payments.length == 0) {
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

  private sendCreatedEvent(context: Context) {
    return async <T extends InvoiceCreatedData>(request: T) => {
      const publishUsecase = new PublishInvoiceCreatedUsecase(this.sqsPublish);
      const data: PublishInvoiceCreatedDTO = {
        ...request,
        messageTimestamp: request.invoice.dateAccepted,
      };
      return publishUsecase.execute(data);
    };
  }

  private sendConfirmedEvent(context: Context) {
    return async <T extends InvoiceConfirmedData>(request: T) => {
      const publishUsecase = new PublishInvoiceConfirmed(this.sqsPublish);
      try {
        const result = await publishUsecase.execute(
          request.invoice,
          request.invoiceItems,
          request.manuscript,
          request.payer,
          request.billingAddress,
          request.invoice.dateIssued
        );
        return right<Errors.PublishInvoiceConfirmError, void>(result);
      } catch (err) {
        return left<Errors.PublishInvoiceConfirmError, void>(
          new Errors.PublishInvoiceConfirmError(
            request.invoice.id.toString(),
            err
          )
        );
      }
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

  private sendCreditedEvent(context: Context) {
    return async <T extends InvoiceCreditedData>(request: T) => {
      const publishUsecase = new PublishInvoiceCredited(this.sqsPublish);
      try {
        const result = await publishUsecase.execute(
          request.invoice,
          request.invoiceItems,
          request.manuscript,
          request.payer,
          request.billingAddress,
          request.invoice.dateIssued
        );
        return right<Errors.PublishInvoiceCreditedError, void>(result);
      } catch (err) {
        return left<Errors.PublishInvoiceCreditedError, void>(
          new Errors.PublishInvoiceCreditedError(
            request.invoice.id.toString(),
            err
          )
        );
      }
    };
  }

  private updateInvoiceStatus(
    status: keyof typeof InvoiceStatus,
    useDate: string,
    useInvoice = true
  ) {
    return <T extends WithInvoice>(request: T) => {
      const { invoice } = request;

      invoice.props.dateUpdated = useInvoice
        ? invoice[useDate]
        : request[useDate];
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

  private publishInvoiceCredited(context: Context) {
    return async (request: DTO) => {
      return new AsyncEither(request)
        .then(this.attachInvoice(context))
        .advanceOrEnd(this.shouldSendCredited)
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .then(this.attachPayer(context))
        .then(this.attachAddress(context))
        .map(this.updateInvoiceStatus('DRAFT', 'dateCreated'))
        .then(this.sendCreditedEvent(context))
        .map(() => request)
        .execute();
    };
  }
}
