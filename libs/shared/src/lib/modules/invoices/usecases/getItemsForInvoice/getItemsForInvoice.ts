// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

// * Usecase specific
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceId } from '../../domain/InvoiceId';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetItemsForInvoiceResponse as Response } from './getItemsForInvoiceResponse';
import { GetItemsForInvoiceDTO as DTO } from './getItemsForInvoiceDTO';
import * as Errors from './getItemsForInvoiceErrors';

export class GetItemsForInvoiceUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract
  ) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    let items: InvoiceItem[];

    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    try {
      try {
        const maybeItems = await this.invoiceItemRepo.getItemsByInvoiceId(
          invoiceId
        );

        if (maybeItems.isLeft()) {
          return left(new Errors.InvoiceHasNoItems(invoiceId.toString()));
        }

        items = maybeItems.value;

        for (const item of items) {
          const [maybeCoupons, maybeWaivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
          ]);

          if (maybeCoupons.isLeft()) {
            return left(
              new UnexpectedError(new Error(maybeCoupons.value.message))
            );
          }

          if (maybeWaivers.isLeft()) {
            return left(
              new UnexpectedError(new Error(maybeWaivers.value.message))
            );
          }

          item.addAssignedCoupons(maybeCoupons.value);
          item.addAssignedWaivers(maybeWaivers.value);
        }
      } catch (err) {
        console.log(err);
        return left(new Errors.InvoiceNotFoundError(invoiceId.id.toString()));
      }

      if (items.length === 0) {
        return left(new Errors.InvoiceHasNoItems(invoiceId.id.toString()));
      } else {
        return right(items);
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
