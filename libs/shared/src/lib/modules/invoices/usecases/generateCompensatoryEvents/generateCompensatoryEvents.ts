// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
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

import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { AddressId } from '../../../addresses/domain/AddressId';
import { Address } from '../../../addresses/domain/Address';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceStatus } from '../../domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

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
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';
import { GetPaymentInfoUsecase } from '../../../payments/usecases/getPaymentInfo';

import { PublishInvoiceConfirmed } from '../publishInvoiceConfirmed';
import { PublishInvoicePaid } from '../publishInvoicePaid';
import { PublishInvoiceCreatedUsecase } from '../publishInvoiceCreated';

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

interface InvoiceConfirmedData extends DTO {
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  address: Address;
  invoice: Invoice;
  payer: Payer;
}

interface InvoiceCreatedData extends DTO {
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  messageTimestamp: Date;
  invoice: Invoice;
}

interface InvoicePayedData extends DTO {
  paymentInfo: InvoicePaymentInfo;
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  paymentDate: Date;
  invoice: Invoice;
  payer: Payer;
}

export class GenerateCompensatoryEventsUsecase
  implements
    UseCase<DTO, Promise<Response>, GenerateCompensatoryEventsContext>,
    AccessControlledUsecase<
      DTO,
      GenerateCompensatoryEventsContext,
      AccessControlContext
    > {
  constructor(
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
    this.attachPaymentInfo = this.attachPaymentInfo.bind(this);
    this.shouldSendCreated = this.shouldSendCreated.bind(this);
    this.attachManuscript = this.attachManuscript.bind(this);
    this.sendCreatedEvent = this.sendCreatedEvent.bind(this);
    this.shouldSendPayed = this.shouldSendPayed.bind(this);
    this.sendPayedEvent = this.sendPayedEvent.bind(this);
    this.attachAddress = this.attachAddress.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: GenerateCompensatoryEventsContext
  ): Promise<Response> {
    const requestExecution = new AsyncEither<null, DTO>(request)
      .then(this.verifyInput)
      .then(this.publishInvoiceCreated(context))
      .then(this.publishInvoiceConfirmed(context))
      .then(this.publishInvoicePayed(context))
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
        return right<null, T & { address: Address }>({
          ...request,
          address: null,
        });
      }

      return new AsyncEither(request.payer.billingAddressId.id.toString())
        .then((billingAddressId) =>
          usecase.execute({ billingAddressId }, context)
        )
        .map((result) => ({
          ...request,
          address: result.getValue(),
        }))
        .execute();
    };
  }

  private attachPaymentInfo(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetPaymentInfoUsecase(
        this.invoiceRepo,
        this.paymentRepo
      );

      return new AsyncEither(request.invoiceId)
        .then((invoiceId) => usecase.execute({ invoiceId }, context))
        .map((result) => ({
          ...request,
          paymentInfo: result.getValue(),
        }))
        .execute();
    };
  }

  private async shouldSendCreated<T extends WithInvoice>(
    request: T
  ): Promise<Either<null, boolean>> {
    if (!request.invoice.dateAccepted) {
      return right(false);
    }

    return right(true);
  }

  private async shouldSendConfirmed<T extends WithInvoice>(
    request: T
  ): Promise<Either<null, boolean>> {
    const { invoice } = request;
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

  private async shouldSendPayed<T extends WithInvoice>(
    request: T
  ): Promise<Either<null, boolean>> {
    const { invoice } = request;
    if (
      invoice.status !== InvoiceStatus.FINAL ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return right(false);
    }
    return right(true);
  }

  private attachPaymentDate(context: Context) {
    return <T extends WithInvoice & { paymentInfo: InvoicePaymentInfo }>(
      request: T
    ) => {
      const { paymentInfo, invoice } = request;
      let paymentDate: Date;

      if (!paymentInfo?.paymentDate) {
        paymentDate = invoice.dateIssued;
      } else {
        paymentDate = new Date(paymentInfo.paymentDate);
      }

      return {
        ...request,
        paymentDate,
      };
    };
  }

  private attachMessageTimestamp(dateToUse: string) {
    return <T extends WithInvoice>(request: T) => {
      return {
        ...request,
        messageTimestamp: request.invoice[dateToUse],
      };
    };
  }

  private sendCreatedEvent(context: Context) {
    return async <T extends InvoiceCreatedData>(request: T) => {
      const publishUsecase = new PublishInvoiceCreatedUsecase(this.sqsPublish);
      return publishUsecase.execute(request, context);
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
          request.address,
          request.invoice.dateIssued
        );
        return right<Errors.PublishInvoiceConfirmError, void>(result);
      } catch (err) {
        return left<Errors.PublishInvoiceConfirmError, void>(
          new Errors.PublishInvoiceConfirmError(request.invoiceId, err)
        );
      }
    };
  }

  private sendPayedEvent(context: Context) {
    return async <T extends InvoicePayedData>(request: T) => {
      const publishUsecase = new PublishInvoicePaid(this.sqsPublish);
      try {
        const result = await publishUsecase.execute(
          request.invoice,
          request.invoiceItems,
          request.manuscript,
          request.paymentInfo,
          request.payer,
          request.paymentDate
        );
        return right<Errors.PublishInvoicePayedError, void>(result);
      } catch (err) {
        return left<Errors.PublishInvoicePayedError, void>(
          new Errors.PublishInvoicePayedError(request.invoiceId, err)
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
        .map(this.attachMessageTimestamp('dateAccepted'))
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
        .then(this.attachPaymentInfo(context))
        .then(this.attachPayer(context))
        .map(this.attachPaymentDate(context))
        .map(this.updateInvoiceStatus('FINAL', 'paymentDate', false))
        .then(this.sendPayedEvent(context))
        .map(() => request)
        .execute();
    };
  }
}
