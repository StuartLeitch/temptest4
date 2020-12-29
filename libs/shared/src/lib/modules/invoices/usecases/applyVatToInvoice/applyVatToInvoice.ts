// * Core Domain
import { Result } from '../../../../core/logic/Result';
import { UseCase } from '../../../../core/domain/UseCase';
import { chain } from '../../../../core/logic/EitherChain';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceItem } from '../../domain/InvoiceItem';

import type { ApplyVatToInvoiceDTO } from './applyVatToInvoiceDTO';
import type { ApplyVatToInvoiceResponse } from './applyVatToInvoiceResponse';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';

import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { UpdateInvoiceItemsUsecase } from '../updateInvoiceItems';

import { VATService } from '../../../../domain/services/VATService';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

export class ApplyVatToInvoiceUsecase
  implements
    UseCase<
      ApplyVatToInvoiceDTO,
      Promise<ApplyVatToInvoiceResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      ApplyVatToInvoiceDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private vatService: VATService
  ) {}

  // @Authorize('payer:read')
  public async execute(
    request: ApplyVatToInvoiceDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<ApplyVatToInvoiceResponse> {
    const { postalCode, payerType, invoiceId, country, state } = request;
    const vat = this.vatService.calculateVAT(
      {
        countryCode: country,
        stateCode: state,
        postalCode,
      },
      payerType !== PayerType.INSTITUTION,
      new Date()
    );

    const maybeApcItemsWithVat = (await this.getInvoiceItems(invoiceId)).map(
      this.attachVatToApcItems.bind(null, vat)
    );

    return (
      await chain([this.updateInvoiceItems.bind(this)], maybeApcItemsWithVat)
    ).map(() => Result.ok<void>());
  }

  private async getInvoiceItems(invoiceId: string) {
    const getItemsForInvoiceUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    return await getItemsForInvoiceUsecase.execute({
      invoiceId,
    });
  }

  private async updateInvoiceItems(invoiceItems: InvoiceItem[]) {
    const updateInvoiceItemsUsecase = new UpdateInvoiceItemsUsecase(
      this.invoiceItemRepo
    );
    return await updateInvoiceItemsUsecase.execute({ invoiceItems });
  }

  private attachVatToApcItems(
    vat: number,
    invoiceItemsResult: Result<InvoiceItem[]>
  ) {
    return invoiceItemsResult
      .getValue()
      .filter((item) => item.type === 'APC')
      .map((apcItem) => {
        apcItem.vat = vat;
        return apcItem;
      });
  }
}
