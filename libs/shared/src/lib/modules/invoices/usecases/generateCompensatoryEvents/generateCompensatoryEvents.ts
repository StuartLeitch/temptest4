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

class GenericError extends AppError.UnexpectedError {}

type Context = AuthorizationContext<Roles>;
export type GenerateCompensatoryEventsContext = Context;

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
    this.getAddressWithId = this.getAddressWithId.bind(this);
    this.getInvoiceItemsForInvoiceId = this.getInvoiceItemsForInvoiceId.bind(
      this
    );
    this.getInvoiceWithId = this.getInvoiceWithId.bind(this);
    this.getManuscriptByInvoiceId = this.getManuscriptByInvoiceId.bind(this);
    this.getPayerForInvoiceId = this.getPayerForInvoiceId.bind(this);
    this.getPaymentInfo = this.getPaymentInfo.bind(this);
    this.publishInvoiceConfirmed = this.publishInvoiceConfirmed.bind(this);
    this.publishInvoiceCreated = this.publishInvoiceCreated.bind(this);
    this.publishInvoicePayed = this.publishInvoicePayed.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.attachManuscript = this.attachManuscript.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
    this.attachAddress = this.attachAddress.bind(this);
    this.attachPaymentInfo = this.attachPaymentInfo.bind(this);
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
  ): Promise<Either<Errors.InvoiceIdRequired, DTO>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequired());
    }

    return right(request);
  }

  private attachInvoice(context: Context) {
    return async <T extends { invoiceId: string }>(request: T) => {
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

  private getInvoiceWithId(context: Context) {
    return async (invoiceId: string) => {
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const maybeResult = await usecase.execute({ invoiceId }, context);
      return maybeResult.map((result) => result.getValue());
    };
  }

  private attachInvoiceItems(context: Context) {
    return async <T extends { invoiceId: string }>(request: T) => {
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

  private async getInvoiceItemsForInvoiceId(invoiceId: InvoiceId) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const maybeResult = await usecase.execute({
      invoiceId: invoiceId.id.toString(),
    });
    return maybeResult.map((result) => result.getValue());
  }

  private attachManuscript(context: Context) {
    return async <T extends { invoiceId: string }>(request: T) => {
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

  private async getManuscriptByInvoiceId(invoiceId: InvoiceId) {
    const usecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const maybeResult = await usecase.execute({
      invoiceId: invoiceId.id.toString(),
    });
    return maybeResult.map((result) => result.getValue());
  }

  private attachPayer(context: Context) {
    return async <T extends { invoiceId: string }>(request: T) => {
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

  private async getPayerForInvoiceId(invoiceId: InvoiceId) {
    try {
      const payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
      return right<GenericError, Payer>(payer);
    } catch (err) {
      return left<GenericError, Payer>(new GenericError(err));
    }
  }

  private attachAddress(context: Context) {
    return async <T extends { payer: Payer }>(request: T) => {
      const usecase = new GetAddressUseCase(this.addressRepo);

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

  private async getAddressWithId(addressId: AddressId) {
    const usecase = new GetAddressUseCase(this.addressRepo);
    const maybeResult = await usecase.execute({
      billingAddressId: addressId.id.toString(),
    });
    return maybeResult.map((result) => result.getValue());
  }

  private attachPaymentInfo(context: Context) {
    return async <T extends { invoiceId: string }>(request: T) => {
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

  private async getPaymentInfo(invoiceId: InvoiceId) {
    try {
      const payment = await this.invoiceRepo.getInvoicePaymentInfo(invoiceId);
      return right<GenericError, InvoicePaymentInfo>(payment);
    } catch (err) {
      return left<GenericError, InvoicePaymentInfo>(new GenericError(err));
    }
  }

  private publishInvoiceCreated(context: Context) {
    return async (request: DTO) => {
      const publishUsecase = new PublishInvoiceCreatedUsecase(this.sqsPublish);
      const execution = new AsyncEither<null, DTO>(request)
        .then(this.attachInvoice(context))
        .then(async (data) => {
          const maybeItems = await this.getInvoiceItemsForInvoiceId(
            data.invoice.invoiceId
          );
          return maybeItems.map((invoiceItems) => ({ ...data, invoiceItems }));
        })
        .then(async (data) => {
          const maybeManuscript = await this.getManuscriptByInvoiceId(
            data.invoice.invoiceId
          );
          return maybeManuscript.map((manuscripts) => ({
            manuscript: manuscripts[0],
            ...data,
          }));
        })
        .map((data) => {
          const { invoice } = data;
          if (!invoice.dateAccepted) {
            return null;
          }
          invoice.props.dateUpdated = invoice.dateAccepted;
          invoice.status = InvoiceStatus.DRAFT;

          return {
            ...data,
            invoice,
            messageTimestamp: invoice.dateAccepted,
          };
        })
        .then(async (publishRequest) => {
          if (!publishRequest) {
            return right<null, null>(null);
          }

          return publishUsecase.execute(publishRequest);
        })
        .map(() => request);
      return execution.execute();
    };
  }

  private publishInvoiceConfirmed(context: Context) {
    return async (request: DTO) => {
      const publishUsecase = new PublishInvoiceConfirmed(this.sqsPublish);
      const execution = new AsyncEither<null, string>(request.invoiceId)
        .then(this.getInvoiceWithId(context))
        .then(async (invoice) => {
          const maybeResult = await this.getInvoiceItemsForInvoiceId(
            invoice.invoiceId
          );
          return maybeResult.map((invoiceItems) => ({ invoice, invoiceItems }));
        })
        .then(async (data) => {
          const maybeResult = await this.getManuscriptByInvoiceId(
            data.invoice.invoiceId
          );
          return maybeResult.map((manuscripts) => ({
            ...data,
            manuscript: manuscripts[0],
          }));
        })
        .then(async (data) => {
          const maybePayer = await this.getPayerForInvoiceId(
            data.invoice.invoiceId
          );
          return maybePayer.map((payer) => ({ ...data, payer }));
        })
        .then(async (data) => {
          if (!data.payer) {
            return right<
              null,
              {
                invoiceItems: InvoiceItem[];
                manuscript: Manuscript;
                invoice: Invoice;
                address: null;
                payer: Payer;
              }
            >({ ...data, address: null });
          }

          const maybeAddress = await this.getAddressWithId(
            data.payer.billingAddressId
          );
          return maybeAddress.map((address) => ({ ...data, address }));
        })
        .map((data) => {
          const invoice = data.invoice;
          if (
            invoice.status === InvoiceStatus.PENDING ||
            invoice.status === InvoiceStatus.DRAFT ||
            !invoice.dateAccepted ||
            !invoice.dateIssued
          ) {
            return null;
          }

          invoice.props.dateUpdated = invoice.dateIssued;
          invoice.status = InvoiceStatus.ACTIVE;

          return { ...data, invoice };
        })
        .then(async (data) => {
          if (!data) {
            return right<null, null>(null);
          }

          try {
            const result = await publishUsecase.execute(
              data.invoice,
              data.invoiceItems,
              data.manuscript,
              data.payer,
              data.address,
              data.invoice.dateIssued
            );
            return right<GenericError, void>(result);
          } catch (err) {
            return left<GenericError, void>(new GenericError(err));
          }
        })
        .map(() => request);

      return execution.execute();
    };
  }

  private publishInvoicePayed(context: Context) {
    return async (request: DTO) => {
      const publishUsecase = new PublishInvoicePaid(this.sqsPublish);
      const execution = new AsyncEither<null, string>(request.invoiceId)
        .then(this.getInvoiceWithId(context))
        .then(async (invoice) => {
          const maybeItems = await this.getInvoiceItemsForInvoiceId(
            invoice.invoiceId
          );
          return maybeItems.map((invoiceItems) => {
            invoiceItems.forEach((item) => invoice.addInvoiceItem(item));
            return invoice;
          });
        })
        .then(async (invoice) => {
          const maybeManuscript = await this.getManuscriptByInvoiceId(
            invoice.invoiceId
          );
          return maybeManuscript.map((manuscripts) => ({
            invoice,
            manuscript: manuscripts[0],
          }));
        })
        .then(async (data) => {
          const maybePaymentInfo = await this.getPaymentInfo(
            data.invoice.invoiceId
          );
          return maybePaymentInfo.map((paymentInfo) => ({
            ...data,
            paymentInfo,
          }));
        })
        .then(async (data) => {
          const maybePayerInfo = await this.getPayerForInvoiceId(
            data.invoice.invoiceId
          );
          return maybePayerInfo.map((payer) => ({ ...data, payer }));
        })
        .map((data) => {
          const invoice = data.invoice;
          if (
            invoice.status !== InvoiceStatus.FINAL ||
            !invoice.dateAccepted ||
            !invoice.dateIssued
          ) {
            return null;
          }
          let paymentDate: Date;
          if (!data.paymentInfo) {
            paymentDate = invoice.dateIssued;
          } else {
            paymentDate = data.paymentInfo.paymentDate
              ? new Date(data.paymentInfo.paymentDate)
              : data.invoice.dateIssued;
          }

          invoice.props.dateUpdated = paymentDate;

          return { ...data, invoice, paymentDate };
        })
        .then(async (data) => {
          if (!data) {
            return right<null, null>(null);
          }

          try {
            const result = await publishUsecase.execute(
              data.invoice,
              data.invoice.invoiceItems.currentItems,
              data.manuscript,
              data.paymentInfo,
              data.payer,
              data.paymentDate
            );
            return right<GenericError, void>(result);
          } catch (err) {
            return left<GenericError, void>(new GenericError(err));
          }
        })
        .map(() => request);
      return execution.execute();
    };
  }
}
