import { UniqueEntityID } from '../../../../../lib/core/domain/UniqueEntityID';
import { CouponType } from '../../domain/Coupon';
import { CouponCode } from '../..//domain/CouponCode';
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { left, right, Result } from '../../../../core/logic/Result';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import {
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';
import { CouponRepoContract } from '../../repos';
import { Roles } from '../../../users/domain/enums/Roles';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
} from '../../../invoices/repos';
import { ApplyCouponToInvoiceDTO } from './applyCouponToInvoiceDTO';
import {
  InvoiceNotFoundError,
  InvoiceStatusInvalidError,
  CouponNotFoundError,
  CouponAlreadyUsedError,
  CouponExpiredError,
  CouponAlreadyUsedForInvoiceError,
  CouponInvalidError,
} from './applyCouponToInvoiceErrors';
import { ApplyCouponToInvoiceResponse } from './applyCouponToInvoiceResponse';
import { InvoiceStatus } from '../../../invoices/domain/Invoice';

export type ApplyCouponToInvoiceContext = AuthorizationContext<Roles>;

export class ApplyCouponToInvoiceUsecase
  implements
    UseCase<
      ApplyCouponToInvoiceDTO,
      Promise<ApplyCouponToInvoiceResponse>,
      ApplyCouponToInvoiceContext
    >,
    AccessControlledUsecase<
      ApplyCouponToInvoiceDTO,
      ApplyCouponToInvoiceContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract
  ) {}

  public async execute(
    request: ApplyCouponToInvoiceDTO,
    context?: ApplyCouponToInvoiceContext
  ): Promise<ApplyCouponToInvoiceResponse> {
    try {
      request.couponCode = request.couponCode.toUpperCase().trim();
      const invoiceId = InvoiceId.create(
        new UniqueEntityID(request.invoiceId)
      ).getValue();
      const couponCode = CouponCode.create(request.couponCode).getValue();

      const invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      if (!invoice) {
        return left(new InvoiceNotFoundError(request.invoiceId));
      }

      if (invoice.status !== InvoiceStatus.DRAFT) {
        return left(
          new InvoiceStatusInvalidError(request.couponCode, request.invoiceId)
        );
      }

      const invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoiceId
      );
      if (!invoiceItems) {
        return left(new InvoiceNotFoundError(request.invoiceId));
      }

      const coupon = await this.couponRepo.getCouponByCode(couponCode);

      if (!coupon) {
        return left(new CouponNotFoundError(request.couponCode));
      }

      if (
        coupon.couponType === CouponType.SINGLE_USE &&
        coupon.redeemCount > 0
      ) {
        return left(new CouponAlreadyUsedError(request.couponCode));
      }

      const now = new Date();
      if (
        coupon.expirationDate &&
        coupon.couponType === CouponType.MULTIPLE_USE &&
        coupon.expirationDate < now
      ) {
        return left(new CouponExpiredError(request.couponCode));
      }

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

      return right(Result.ok(coupon));
    } catch (error) {
      return left(new AppError.UnexpectedError(error));
    }
  }
}
