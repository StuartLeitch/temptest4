import { UniqueEntityID } from '../../../../../lib/core/domain/UniqueEntityID';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic

import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import { Roles } from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { VATService } from '../../../../domain/services/VATService';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { TransactionRepoContract } from '../../../transactions/repos';

import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { PayerMap } from '../../../payers/mapper/Payer';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { PayerType } from '../../../payers/domain/Payer';

import { ConfirmInvoiceUsecase } from '../../../invoices/usecases/confirmInvoice/confirmInvoice';
import { ConfirmInvoiceDTO } from '../../../invoices/usecases/confirmInvoice/confirmInvoiceDTO';
import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceStatus } from '../../../invoices/domain/Invoice';

import { TransactionStatus } from '../../../transactions/domain/Transaction';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { GetManuscriptByManuscriptIdUsecase } from './../../../manuscripts/usecases/getManuscriptByManuscriptId/getManuscriptByManuscriptId';
import { Coupon, CouponType, CouponStatus } from '../../domain/Coupon';
import { CouponCode } from '../../domain/CouponCode';
import { CouponAssigned } from '../../domain/CouponAssigned';

import { ApplyCouponToInvoiceResponse } from './applyCouponToInvoiceResponse';
import { ApplyCouponToInvoiceDTO } from './applyCouponToInvoiceDTO';
import {
  CouponAlreadyUsedForInvoiceError,
  InvoiceConfirmationFailed,
  InvoiceStatusInvalidError,
  CouponAlreadyUsedError,
  InvoiceNotFoundError,
  CouponInactiveError,
  CouponNotFoundError,
  CouponExpiredError,
  CouponInvalidError,
} from './applyCouponToInvoiceErrors';

export class ApplyCouponToInvoiceUsecase
  implements
    UseCase<
      ApplyCouponToInvoiceDTO,
      Promise<ApplyCouponToInvoiceResponse>,
      UsecaseAuthorizationContext
    > {
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
    private loggerService: LoggerContract
  ) {}

  public async execute(
    request: ApplyCouponToInvoiceDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<ApplyCouponToInvoiceResponse> {
    const {
      invoiceItemRepo,
      transactionRepo,
      invoiceRepo,
      addressRepo,
      payerRepo,
      couponRepo,
      waiverRepo,
      emailService,
      vatService,
      loggerService,
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

      const maybeInvoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoice.invoiceId
      );

      if (maybeInvoiceItems.isLeft()) {
        return left(new InvoiceNotFoundError(request.invoiceId));
      }

      const invoiceItems = maybeInvoiceItems.value;

      // * Associate the Invoice Items instances to the Invoice instance
      invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));

      let assignedCoupons = 0;
      for (const invoiceItem of invoiceItems) {
        if (coupon.invoiceItemType !== invoiceItem.type) {
          continue;
        }

        const maybeExistingCoupons = await this.couponRepo.getCouponsByInvoiceItemId(
          invoiceItem.invoiceItemId
        );

        if (maybeExistingCoupons.isLeft()) {
          return left(maybeExistingCoupons.value);
        }

        const existingCoupons = maybeExistingCoupons.value;

        if (
          existingCoupons.coupons.some((c) =>
            c.couponId.equals(coupon.couponId)
          )
        ) {
          return left(new CouponAlreadyUsedForInvoiceError(request.couponCode));
        }

        invoiceItem.addAssignedCoupons(existingCoupons);
        const newCouponAssignment = CouponAssigned.create({
          invoiceItemId: invoiceItem.invoiceItemId,
          dateAssigned: null,
          coupon,
        });
        invoiceItem.addAssignedCoupon(newCouponAssignment);

        await this.couponRepo.assignCouponToInvoiceItem(
          coupon,
          invoiceItem.invoiceItemId
        );
        assignedCoupons++;
      }

      if (assignedCoupons === 0) {
        return left(
          new CouponInvalidError(request.couponCode, request.invoiceId)
        );
      }

      const total = invoice.invoiceItems
        .getItems()
        .reduce((sum, ii) => sum + ii.calculateNetPrice(), 0);

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (total <= 0) {
        const manuscriptId = [...invoice.invoiceItems.getItems()].shift()
          .manuscriptId;

        const manuscriptResult = await this.getManuscript(manuscriptId);
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
          emailService,
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

        const transaction = await this.getTransaction(invoice);
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
              return left(new InvoiceConfirmationFailed(result.value.message));
            }
          } catch (err) {
            console.error(err);
            return left(
              new Error('confirmUsecase inside applyCoupon failed.') as any
            );
          }
        }
      }
      invoice.generateInvoiceDraftAmountUpdatedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(coupon);
    } catch (error) {
      return left(new UnexpectedError(error));
    }
  }

  private async getTransaction(invoice: Invoice) {
    const { transactionRepo } = this;

    const usecase = new GetTransactionUsecase(transactionRepo);
    const transactionId = invoice?.transactionId?.id?.toString();

    const result = await usecase.execute({ transactionId }, {
      roles: [Roles.SUPER_ADMIN],
    } as UsecaseAuthorizationContext);

    if (result.isLeft()) {
      return new Error(result.value.message);
    }

    return result.value;
  }

  private async getManuscript(manuscriptId: ManuscriptId) {
    const { manuscriptRepo, loggerService } = this;

    loggerService.info(
      `Get manuscript details for Manuscript with id ${manuscriptId.id.toString()}`
    );

    const usecase = new GetManuscriptByManuscriptIdUsecase(manuscriptRepo);

    const result = await usecase.execute(
      { manuscriptId: manuscriptId?.id?.toString() },
      {
        roles: [Roles.SUPER_ADMIN],
      } as UsecaseAuthorizationContext
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
      return new InvoiceStatusInvalidError(
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
      return maybeCoupon.value;
    }

    const coupon = maybeCoupon.value;

    if (!coupon) {
      return new CouponNotFoundError(request.couponCode);
    }

    if (coupon.status === CouponStatus.INACTIVE) {
      return new CouponInactiveError(request.couponCode);
    }

    if (coupon.couponType === CouponType.SINGLE_USE && coupon.redeemCount > 0) {
      return new CouponAlreadyUsedError(request.couponCode);
    }

    const now = new Date();
    if (
      coupon.expirationDate &&
      coupon.couponType === CouponType.MULTIPLE_USE &&
      coupon.expirationDate < now
    ) {
      return new CouponExpiredError(request.couponCode);
    }

    return coupon;
  }
}
