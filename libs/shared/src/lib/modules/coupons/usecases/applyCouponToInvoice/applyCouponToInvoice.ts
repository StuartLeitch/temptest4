import { UniqueEntityID } from '../../../../../lib/core/domain/UniqueEntityID';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';

// * Authorization Logic

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { VATService } from '../../../../domain/services/VATService';
import { AuditLoggerServiceContract } from '../../../../infrastructure/audit/AuditLoggerService';

import { TransactionStatus } from '../../../transactions/domain/Transaction';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { Coupon, CouponType, CouponStatus } from '../../domain/Coupon';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { CouponAssigned } from '../../domain/CouponAssigned';
import { PayerType } from '../../../payers/domain/Payer';
import { CouponCode } from '../../domain/CouponCode';

import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { PayerMap } from '../../../payers/mapper/Payer';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { TransactionRepoContract } from '../../../transactions/repos';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';

import { GetManuscriptByManuscriptIdUsecase } from './../../../manuscripts/usecases/getManuscriptByManuscriptId/getManuscriptByManuscriptId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice';
import {
  ConfirmInvoiceUsecase,
  ConfirmInvoiceDTO,
} from '../../../invoices/usecases/confirmInvoice';

import { ApplyCouponToInvoiceResponse as Response } from './applyCouponToInvoiceResponse';
import type { ApplyCouponToInvoiceDTO as DTO } from './applyCouponToInvoiceDTO';
import * as Errors from './applyCouponToInvoiceErrors';

export class ApplyCouponToInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private payerRepo: PayerRepoContract,
    private waiverRepo: WaiverRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private loggerService: LoggerContract,
    private auditLoggerService: AuditLoggerServiceContract
  ) {
    super();
  }

  @Authorize('coupon:apply')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
      invoiceItemRepo,
      transactionRepo,
      invoiceRepo,
      addressRepo,
      payerRepo,
      couponRepo,
      waiverRepo,
      // emailService,
      vatService,
      loggerService,
      // auditLoggerService
    } = this;
    const {
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;

    try {
      // * Get Invoice details
      const invoiceResult = await this.getInvoice(request);
      if (!(invoiceResult instanceof Invoice)) {
        return left(invoiceResult);
      }
      const invoice = invoiceResult as Invoice;

      // * Get Coupon details
      const couponResult = await this.getCouponByCode(request);
      if (!(couponResult instanceof Coupon)) {
        return left(couponResult);
      }

      const coupon = couponResult as Coupon;

      const maybeInvoiceItems = await this.getInvoiceItems(
        invoice.invoiceId,
        context
      );

      if (maybeInvoiceItems.isLeft()) {
        return left(
          new Errors.InvoiceItemsNotFoundError(
            request.invoiceId,
            new Error(maybeInvoiceItems.value.message)
          )
        );
      }

      const invoiceItems = maybeInvoiceItems.value;

      // * Associate the Invoice Items instances to the Invoice instance
      invoice.addItems(invoiceItems);

      let assignedCoupons = 0;
      for (const invoiceItem of invoiceItems) {
        if (coupon.invoiceItemType !== invoiceItem.type) {
          continue;
        }

        const newCouponAssignment = CouponAssigned.create({
          invoiceItemId: invoiceItem.invoiceItemId,
          dateAssigned: null,
          coupon,
        });

        if (invoiceItem.assignedCoupons.exists(newCouponAssignment)) {
          return left(
            new Errors.CouponAlreadyUsedForInvoiceError(request.couponCode)
          );
        }

        invoiceItem.addAssignedCoupon(newCouponAssignment);

        const maybeAssigned = await this.couponRepo.assignCouponToInvoiceItem(
          coupon,
          invoiceItem.invoiceItemId
        );

        if (maybeAssigned.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeAssigned.value.message))
          );
        }

        assignedCoupons++;
      }

      if (assignedCoupons === 0) {
        return left(
          new Errors.CouponInvalidError(request.couponCode, request.invoiceId)
        );
      }

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (invoice.invoiceTotal <= 0) {
        const manuscriptId = invoice.invoiceItems.getItems()[0].manuscriptId;

        const manuscriptResult = await this.getManuscript(
          manuscriptId,
          context
        );
        if (manuscriptResult instanceof Error) {
          return left(manuscriptResult as any);
        }

        const manuscript = manuscriptResult as Manuscript;

        // * but we can auto-confirm it
        const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
          invoiceItemRepo,
          transactionRepo,
          addressRepo,
          invoiceRepo,
          couponRepo,
          waiverRepo,
          payerRepo,
          loggerService,
          vatService
        );

        // * create new address
        const maybeAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        if (maybeAddress.isLeft()) {
          return left(maybeAddress.value);
        }

        const newAddress = maybeAddress.value;

        // * create new payer
        const maybeNewPayer = PayerMap.toDomain({
          // * associate new payer to the invoice
          invoiceId: invoice.invoiceId.id.toString(),
          name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
          email: manuscript.authorEmail,
          addressId: newAddress.addressId.id.toString(),
          organization: ' ',
          type: PayerType.INDIVIDUAL,
        });

        if (maybeNewPayer.isLeft()) {
          return left(maybeNewPayer.value);
        }

        const newPayer = maybeNewPayer.value;

        const confirmInvoiceArgs: ConfirmInvoiceDTO = {
          payer: {
            ...PayerMap.toPersistence(newPayer),
            address: AddressMap.toPersistence(newAddress),
          },
          sanctionedCountryNotificationReceiver,
          sanctionedCountryNotificationSender,
        };

        const transaction = await this.getTransaction(invoice, context);
        if (transaction instanceof Error) {
          return left(transaction as any);
        }

        // * if transaction is ACTIVE
        if (transaction.status === TransactionStatus.ACTIVE) {
          // * Confirm the invoice automagically
          try {
            const result = await confirmInvoiceUsecase.execute(
              confirmInvoiceArgs,
              context
            );

            if (result.isLeft()) {
              return left(
                new Errors.InvoiceConfirmationFailed(result.value.message)
              );
            }
          } catch (err) {
            console.error(err);
            return left(
              new Error('confirmUsecase inside applyCoupon failed.') as any
            );
          }
        }
      }

      // * Save the audit log
      this.auditLoggerService.log({
        action: 'has applied',
        entity: 'coupon',
        item_reference: coupon.code.props.value,
        target: `Invoice #{invoice.id.toString()}`,
        timestamp: new Date(),
      });

      invoice.generateInvoiceDraftAmountUpdatedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(coupon);
    } catch (error) {
      return left(new UnexpectedError(error));
    }
  }

  private async getTransaction(invoice: Invoice, context: Context) {
    const { transactionRepo } = this;

    const usecase = new GetTransactionUsecase(transactionRepo);
    const transactionId = invoice?.transactionId?.id?.toString();

    const result = await usecase.execute({ transactionId }, context);

    if (result.isLeft()) {
      return new Error(result.value.message);
    }

    return result.value;
  }

  private async getManuscript(manuscriptId: ManuscriptId, context: Context) {
    const { manuscriptRepo, loggerService } = this;

    loggerService.info(
      `Get manuscript details for Manuscript with id ${manuscriptId.id.toString()}`
    );

    const usecase = new GetManuscriptByManuscriptIdUsecase(manuscriptRepo);

    const result = await usecase.execute(
      { manuscriptId: manuscriptId?.id?.toString() },
      context
    );

    if (result.isLeft()) {
      return new Error(result.value.message);
    }

    return result.value;
  }

  private async getInvoice(request: Record<string, any>) {
    const { invoiceRepo } = this;

    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    const maybeInvoice = await invoiceRepo.getInvoiceById(invoiceId);

    if (maybeInvoice.isLeft()) {
      return maybeInvoice.value;
    }

    const invoice = maybeInvoice.value;

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return new Errors.InvoiceStatusInvalidError(
        request.couponCode,
        invoice.persistentReferenceNumber
      );
    }

    return invoice;
  }

  private async getCouponByCode(request: any) {
    const { couponRepo } = this;

    request.couponCode = request.couponCode.toUpperCase().trim();
    const maybeCouponCode = CouponCode.create(request.couponCode);
    if (maybeCouponCode.isLeft()) {
      return maybeCouponCode.value;
    }
    const couponCode = maybeCouponCode.value;

    const maybeCoupon = await couponRepo.getCouponByCode(couponCode);

    if (maybeCoupon.isLeft()) {
      if (
        maybeCoupon.value instanceof RepoError &&
        maybeCoupon.value.code === RepoErrorCode.ENTITY_NOT_FOUND
      ) {
        return new Errors.CouponNotFoundError(request.couponCode);
      }

      return maybeCoupon.value;
    }

    const coupon = maybeCoupon.value;

    if (!coupon) {
      return new Errors.CouponNotFoundError(request.couponCode);
    }

    if (coupon.status === CouponStatus.INACTIVE) {
      return new Errors.CouponInactiveError(request.couponCode);
    }

    if (coupon.couponType === CouponType.SINGLE_USE && coupon.redeemCount > 0) {
      return new Errors.CouponAlreadyUsedError(request.couponCode);
    }

    const now = new Date();
    if (
      coupon.expirationDate &&
      coupon.couponType === CouponType.MULTIPLE_USE &&
      coupon.expirationDate < now
    ) {
      return new Errors.CouponExpiredError(request.couponCode);
    }

    return coupon;
  }

  private async getInvoiceItems(invoiceId: InvoiceId, context: Context) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    return usecase.execute({ invoiceId: invoiceId.toString() }, context);
  }
}
