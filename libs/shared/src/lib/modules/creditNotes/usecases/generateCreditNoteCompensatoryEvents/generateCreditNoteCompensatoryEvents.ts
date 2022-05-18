// * Core Domain
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { flatten, Either, right, left } from '../../../../core/logic/Either';
import { LoggerContract } from '../../../../infrastructure/logging';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
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

import { CouponAssigned } from '../../../coupons/domain/CouponAssigned';
import { WaiverAssigned } from '../../../waivers/domain/WaiverAssigned';
import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { Address } from '../../../addresses/domain/Address';
import { Invoice } from '../../../invoices/domain/Invoice';
import { Payment } from '../../../payments/domain/Payment';
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

import {
  PublishCreditNoteCreatedUsecase,
  PublishCreditNoteCreatedDTO,
} from '../publishEvents/publishCreditNoteCreated';

// * Usecase specific
import { GenerateCreditNoteCompensatoryEventsResponse as Response } from './generateCreditNoteCompensatoryEventsResponse';
import type { GenerateCreditNoteCompensatoryEventsDTO as DTO } from './generateCreditNoteCompensatoryEventsDTO';
import * as Errors from './generateCreditNoteCompensatoryEventsErrors';

import {
  WithCreditNoteId,
  WithInvoiceItems,
  WithPublishDTO,
  WithCreditNote,
  WithInvoice,
  WithPayer,
} from './actionTypes';

export class GenerateCreditNoteCompensatoryEventsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
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

    this.sendCreditNoteCreatedEvent =
      this.sendCreditNoteCreatedEvent.bind(this);
    this.publishCreditNoteCreated = this.publishCreditNoteCreated.bind(this);
    this.attachPaymentMethods = this.attachPaymentMethods.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.attachCreditNote = this.attachCreditNote.bind(this);
    this.attachAddress = this.attachAddress.bind(this);
    this.attachArticle = this.attachArticle.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
    this.attachPayments = this.attachPayments.bind(this);
    this.attachCoupons = this.attachCoupons.bind(this);
    this.attachWaivers = this.attachWaivers.bind(this);
    this.verifyInput = this.verifyInput.bind(this);
    this.attachPayer = this.attachPayer.bind(this);
  }

  @Authorize('creditNote:generateCompensatoryEvents')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither<null, DTO>(request)
        .then(this.verifyInput)
        .then(this.publishCreditNoteCreated(context))
        .map(() => null)
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
    return async (request: DTO): Promise<Either<UnexpectedError, DTO>> => {
      const result = await new AsyncEither(request)
        .then(this.attachPaymentMethods)
        .then(this.attachCreditNote)
        .then(this.attachInvoice)
        .then(this.attachInvoiceItems)
        .then(this.attachCoupons)
        .then(this.attachWaivers)
        .then(this.attachArticle)
        .then(this.attachPayer)
        .then(this.attachAddress)
        .then(this.attachPayments)
        .then(this.sendCreditNoteCreatedEvent(context))
        .map(() => request)
        .execute();

      return result;
    };
  }

  private sendCreditNoteCreatedEvent(context: Context) {
    return async <T extends WithPublishDTO>(
      request: T
    ): Promise<Either<UnexpectedError, T>> => {
      const usecase = new PublishCreditNoteCreatedUsecase(this.sqsPublish);

      const invoiceItems = request.invoiceItems.map((item) => {
        const coupons = request.coupons.filter((c) =>
          c.invoiceItemId.equals(item.invoiceItemId)
        );
        const waivers = request.waivers.filter((w) =>
          w.invoiceItemId.equals(item.invoiceItemId)
        );

        item.addAssignedCoupons(coupons);
        item.addAssignedWaivers(waivers);

        return item;
      });

      const dto: PublishCreditNoteCreatedDTO = {
        paymentMethods: request.paymentMethods,
        billingAddress: request.billingAddress,
        creditNote: request.creditNote,
        manuscript: request.article,
        invoiceItems: invoiceItems,
        payments: request.payments,
        invoice: request.invoice,
        payer: request.payer,
      };

      const maybeSent = await usecase.execute(dto, context);

      if (maybeSent.isLeft()) {
        return left(new UnexpectedError(new Error(maybeSent.value.message)));
      }

      return right(request);
    };
  }

  private async attachCreditNote<T extends WithCreditNoteId>(
    request: T
  ): Promise<Either<UnexpectedError, T & { creditNote: CreditNote }>> {
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
  }

  private async attachInvoice<T extends WithCreditNote>(
    request: T
  ): Promise<Either<UnexpectedError, T & { invoice: Invoice }>> {
    const maybeInvoice = await this.invoiceRepo.getInvoiceById(
      request.creditNote.invoiceId
    );

    if (maybeInvoice.isLeft()) {
      return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
    }

    return right({ ...request, invoice: maybeInvoice.value });
  }

  private async attachInvoiceItems<T extends WithInvoice>(
    request: T
  ): Promise<Either<UnexpectedError, T & { invoiceItems: InvoiceItem[] }>> {
    const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
      request.invoice.invoiceId
    );

    if (maybeInvoiceItems.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeInvoiceItems.value.message))
      );
    }

    return right({ ...request, invoiceItems: maybeInvoiceItems.value });
  }

  private async attachWaivers<T extends WithInvoiceItems>(
    request: T
  ): Promise<Either<UnexpectedError, T & { waivers: WaiverAssigned[] }>> {
    const getMaybeWaivers = async (
      item
    ): Promise<Either<UnexpectedError, WaiverAssigned[]>> => {
      const maybeWaivers = await this.waiverRepo.getWaiversByInvoiceItemId(
        item.invoiceItemId
      );

      if (maybeWaivers.isLeft()) {
        return left(new UnexpectedError(new Error(maybeWaivers.value.message)));
      }

      return right(maybeWaivers.value.currentItems);
    };

    const maybeWaivers = flatten(
      await Promise.all(request.invoiceItems.map(getMaybeWaivers))
    );

    if (maybeWaivers.isLeft()) {
      return left(maybeWaivers.value);
    }

    const [initialList, ...remainingWaivers] = maybeWaivers.value;

    const waivers = initialList.concat(...remainingWaivers);

    return right({ ...request, waivers });
  }

  private async attachCoupons<T extends WithInvoiceItems>(
    request: T
  ): Promise<Either<UnexpectedError, T & { coupons: CouponAssigned[] }>> {
    const getMaybeCoupons = async (
      item
    ): Promise<Either<UnexpectedError, CouponAssigned[]>> => {
      const maybeCoupons = await this.couponRepo.getCouponsByInvoiceItemId(
        item.invoiceItemId
      );

      if (maybeCoupons.isLeft()) {
        return left(new UnexpectedError(new Error(maybeCoupons.value.message)));
      }

      return right(maybeCoupons.value.currentItems);
    };

    const maybeCoupons = flatten(
      await Promise.all(request.invoiceItems.map(getMaybeCoupons))
    );

    if (maybeCoupons.isLeft()) {
      return left(maybeCoupons.value);
    }

    const [initialList, ...remainingWaivers] = maybeCoupons.value;

    const coupons = initialList.concat(...remainingWaivers);

    return right({ ...request, coupons });
  }

  private async attachArticle<T extends WithCreditNote>(
    request: T
  ): Promise<Either<UnexpectedError, T & { article: Manuscript }>> {
    const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
      request.creditNote.invoiceId
    );

    if (maybeInvoiceItems.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeInvoiceItems.value.message))
      );
    }

    const [item] = maybeInvoiceItems.value;

    const maybeArticle = await this.manuscriptRepo.findById(item.manuscriptId);

    if (maybeArticle.isLeft()) {
      return left(new UnexpectedError(new Error(maybeArticle.value.message)));
    }

    return right({ ...request, article: maybeArticle.value });
  }

  private async attachPaymentMethods<T>(
    request: T
  ): Promise<Either<UnexpectedError, T & { paymentMethods: PaymentMethod[] }>> {
    const maybeMethods = await this.paymentMethodRepo.getPaymentMethods();

    if (maybeMethods.isLeft()) {
      return left(new UnexpectedError(new Error(maybeMethods.value.message)));
    }

    return right({ ...request, paymentMethods: maybeMethods.value });
  }

  private async attachPayer<T extends WithCreditNote>(
    request: T
  ): Promise<Either<UnexpectedError, T & { payer: Payer }>> {
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
  }

  private async attachAddress<T extends WithPayer>(
    request: T
  ): Promise<Either<UnexpectedError, T & { billingAddress: Address }>> {
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
  }

  private async attachPayments<T extends WithCreditNote>(
    request: T
  ): Promise<Either<UnexpectedError, T & { payments: Payment[] }>> {
    const maybePayments = await this.paymentRepo.getPaymentsByInvoiceId(
      request.creditNote.invoiceId
    );

    if (maybePayments.isLeft()) {
      return left(new UnexpectedError(new Error(maybePayments.value.message)));
    }

    return right({ ...request, payments: maybePayments.value });
  }
}
