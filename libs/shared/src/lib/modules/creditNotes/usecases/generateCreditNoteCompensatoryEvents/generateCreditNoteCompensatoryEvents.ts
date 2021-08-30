// * Core Domain
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { Invoice } from '../../../invoices/domain/Invoice';
import { CreditNoteId } from '../../domain/CreditNoteId';
import { CreditNote } from '../../domain/CreditNote';
import { Payer } from '../../../payers/domain/Payer';

import { PaymentMethodRepoContract } from '../../../payments/repos/paymentMethodRepo';
import { CreditNoteRepoContract } from '../../../creditNotes/repos/creditNoteRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PaymentRepoContract } from '../../../payments/repos/paymentRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';

import { PublishCreditNoteCreatedUsecase } from '../publishEvents/publishCreditNoteCreated';

// * Usecase specific
import { GenerateCreditNoteCompensatoryEventsResponse as Response } from './generateCreditNoteCompensatoryEventsResponse';
import type { GenerateCreditNoteCompensatoryEventsDTO as DTO } from './generateCreditNoteCompensatoryEventsDTO';
import * as Errors from './generateCreditNoteCompensatoryEventsErrors';

import {
  WithCreditNote,
  WithCreditNoteId,
  WithInvoice,
  WithPayer,
} from './actionTypes';

export class GenerateCreditNoteCompensatoryEventsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private creditNoteRepo: CreditNoteRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private sqsPublish: SQSPublishServiceContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.publishCreditNoteCreated = this.publishCreditNoteCreated.bind(this);
    this.attachPaymentMethods = this.attachPaymentMethods.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.attachCreditNote = this.attachCreditNote.bind(this);
    this.attachAddress = this.attachAddress.bind(this);
    this.attachArticle = this.attachArticle.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
  }

  @Authorize('creditNote:generateCompensatoryEvents')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither<null, DTO>(request)
        .then(this.verifyInput)
        .map((): void => null)
        .execute();
      return execution as Response;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async verifyInput(
    request: DTO
  ): Promise<Either<Errors.CreditNoteIdRequiredError, DTO>> {
    if (!request.creditNoteId) {
      return left(new Errors.CreditNoteIdRequiredError());
    }

    return right(request);
  }

  private publishCreditNoteCreated(context: Context) {
    return async (request: DTO) => {
      const usecase = new PublishCreditNoteCreatedUsecase(this.sqsPublish);

      const result = await new AsyncEither(request).execute();

      return result;
    };
  }

  private attachCreditNote(context: Context) {
    return async <T extends WithCreditNoteId>(
      request: T
    ): Promise<Either<UnexpectedError, T & { creditNote: CreditNote }>> => {
      const creditNoteId = CreditNoteId.create(
        new UniqueEntityID(request.creditNoteId)
      );

      const maybeCreditNote = await this.creditNoteRepo.getCreditNoteById(
        creditNoteId
      );

      if (maybeCreditNote.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCreditNote.value.message))
        );
      }
      return right({ ...request, creditNote: maybeCreditNote.value });
    };
  }

  private attachInvoice(context: Context) {
    return async <T extends WithCreditNote>(
      request: T
    ): Promise<Either<UnexpectedError, T & { invoice: Invoice }>> => {
      const maybeInvoice = await this.invoiceRepo.getInvoiceById(
        request.creditNote.invoiceId
      );

      if (maybeInvoice.isLeft()) {
        return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
      }

      return right({ ...request, invoice: maybeInvoice.value });
    };
  }

  private attachInvoiceItems(context: Context) {
    return async <T extends WithInvoice>(
      request: T
    ): Promise<Either<UnexpectedError, T>> => {
      const { invoice } = request;

      const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoice.invoiceId
      );

      if (maybeInvoiceItems.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeInvoiceItems.value.message))
        );
      }

      invoice.addItems(maybeInvoiceItems.value);

      return right({ ...request, invoice });
    };
  }

  private attachArticle(context: Context) {
    return async <T extends WithCreditNote>(
      request: T
    ): Promise<Either<UnexpectedError, T & { article: Manuscript }>> => {
      const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        request.creditNote.invoiceId
      );

      if (maybeInvoiceItems.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeInvoiceItems.value.message))
        );
      }

      const [item] = maybeInvoiceItems.value;

      const maybeArticle = await this.manuscriptRepo.findById(
        item.manuscriptId
      );

      if (maybeArticle.isLeft()) {
        return left(new UnexpectedError(new Error(maybeArticle.value.message)));
      }

      return right({ ...request, article: maybeArticle.value });
    };
  }

  private attachPaymentMethods(context: Context) {
    return async <T>(
      request: T
    ): Promise<
      Either<UnexpectedError, T & { paymentMethods: PaymentMethod[] }>
    > => {
      const maybeMethods = await this.paymentMethodRepo.getPaymentMethods();

      if (maybeMethods.isLeft()) {
        return left(new UnexpectedError(new Error(maybeMethods.value.message)));
      }

      return right({ ...request, paymentMethods: maybeMethods.value });
    };
  }

  private attachPayer(context: Context) {
    return async <T extends WithCreditNote>(
      request: T
    ): Promise<Either<UnexpectedError, T & { payer: Payer }>> => {
      const maybePayer = await this.payerRepo.getPayerByInvoiceId(
        request.creditNote.invoiceId
      );

      if (maybePayer.isLeft()) {
        const err = maybePayer.value;
        if (
          err instanceof RepoError &&
          err.code === RepoErrorCode.ENTITY_NOT_FOUND
        ) {
          return right({ ...request, payer: null });
        } else {
          return left(new UnexpectedError(new Error(err.message)));
        }
      }

      return right({ ...request, payer: maybePayer.value });
    };
  }

  private attachAddress(context: Context) {
    return async <T extends WithPayer>(
      request: T
    ): Promise<Either<UnexpectedError, T & { billingAddress: Address }>> => {
      const maybeAddress = await this.addressRepo.findById(
        request.payer.billingAddressId
      );

      if (maybeAddress.isLeft()) {
        const err = maybeAddress.value;

        if (
          err instanceof RepoError &&
          err.code === RepoErrorCode.ENTITY_NOT_FOUND
        ) {
          return right({ ...request, billingAddress: null });
        } else {
          return left(new UnexpectedError(new Error(err.message)));
        }
      }

      return right({ ...request, billingAddress: maybeAddress.value });
    };
  }

  private attachPayments(context: Context) {}
}
