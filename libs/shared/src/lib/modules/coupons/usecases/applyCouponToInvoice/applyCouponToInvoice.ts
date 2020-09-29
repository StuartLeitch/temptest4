import { UniqueEntityID } from '../../../../../lib/core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { left, right, Result } from '../../../../core/logic/Result';

// * Authorization Logic

import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Roles,
} from '../../../../domain/authorization';

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
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
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

import { ApplyCouponToInvoiceDTO } from './applyCouponToInvoiceDTO';
import {
  InvoiceNotFoundError,
  InvoiceStatusInvalidError,
  CouponNotFoundError,
  CouponAlreadyUsedError,
  CouponExpiredError,
  CouponAlreadyUsedForInvoiceError,
  CouponInvalidError,
  CouponInactiveError,
} from './applyCouponToInvoiceErrors';
import { ApplyCouponToInvoiceResponse } from './applyCouponToInvoiceResponse';

export class ApplyCouponToInvoiceUsecase
  implements
    UseCase<
      ApplyCouponToInvoiceDTO,
      Promise<ApplyCouponToInvoiceResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      ApplyCouponToInvoiceDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
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
      // manuscriptRepo,
      invoiceItemRepo,
      invoiceRepo,
      addressRepo,
      payerRepo,
      couponRepo,
      // transactionRepo,
      waiverRepo,
      emailService,
      vatService,
      loggerService,
    } = this;
    const {
      // customId,
      // published,
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

      const invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoice.invoiceId
      );
      if (!invoiceItems) {
        return left(new InvoiceNotFoundError(request.invoiceId));
      }

      // * Associate the Invoice Items instances to the Invoice instance
      invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));

      let assignedCoupons = 0;
      for (const invoiceItem of invoiceItems) {
        if (coupon.invoiceItemType !== invoiceItem.type) {
          continue;
        }

        const existingCoupons = await this.couponRepo.getCouponsByInvoiceItemId(
          invoiceItem.invoiceItemId
        );
        if (existingCoupons.some((c) => c.couponId.equals(coupon.couponId))) {
          return left(new CouponAlreadyUsedForInvoiceError(request.couponCode));
        }

        existingCoupons.forEach((ec) => invoiceItem.addCoupon(ec));
        invoiceItem.addCoupon(coupon);

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
        const manuscriptId = ManuscriptId.create(
          new UniqueEntityID(
            [...invoice.invoiceItems.getItems()]
              .shift()
              .manuscriptId.id.toString()
          )
        ).getValue();

        const manuscriptResult = await this.getManuscript(manuscriptId);
        if (manuscriptResult instanceof Error) {
          return left(manuscriptResult);
        }

        const manuscript = manuscriptResult as Manuscript;

        // * but we can auto-confirm it
        const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
          invoiceItemRepo,
          addressRepo,
          invoiceRepo,
          payerRepo,
          couponRepo,
          waiverRepo,
          emailService,
          vatService,
          loggerService
        );

        // * create new address
        const newAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        // * create new payer
        const newPayer = PayerMap.toDomain({
          // * associate new payer to the invoice
          invoiceId: invoice.invoiceId.id.toString(),
          name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
          email: manuscript.authorEmail,
          addressId: newAddress.addressId.id.toString(),
          organization: ' ',
          type: PayerType.INDIVIDUAL,
        });

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
          return left(transaction);
        }

        // * if transaction is ACTIVE
        if (transaction.status === TransactionStatus.ACTIVE) {
          // * Confirm the invoice automagically
          try {
            await confirmInvoiceUsecase.execute(confirmInvoiceArgs, context);
          } catch (err) {
            console.error(err);
            return left(new Error('confirmUsecase inside applyCoupon failed.'));
          }
        }
      }
      invoice.generateInvoiceDraftAmountUpdatedEvent();
      DomainEvents.dispatchEventsForAggregate(invoice.id);

      return right(Result.ok(coupon));
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

    if (result.isFailure) {
      return new Error(result.error as any);
    }

    return result.getValue();
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

    if (result.value.isFailure) {
      return new Error(result.value.errorValue as any);
    }

    return result.value.getValue();
  }

  private async getInvoice(request: Record<string, any>) {
    const { invoiceRepo } = this;

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    const invoice = await invoiceRepo.getInvoiceById(invoiceId);
    if (!invoice) {
      return new InvoiceNotFoundError(invoiceId.id.toString());
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return new InvoiceStatusInvalidError(
        request.couponCode,
        request.invoiceId
      );
    }

    return invoice;
  }

  private async getCouponByCode(request: any) {
    const { couponRepo } = this;

    request.couponCode = request.couponCode.toUpperCase().trim();
    const couponCode = CouponCode.create(request.couponCode).getValue();

    const coupon = await couponRepo.getCouponByCode(couponCode);

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
