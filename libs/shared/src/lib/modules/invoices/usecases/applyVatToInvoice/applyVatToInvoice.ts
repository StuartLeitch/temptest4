// * Core Domain
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

// * Usecase specific
import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceItem } from '../../domain/InvoiceItem';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { UpdateInvoiceItemsUsecase } from '../updateInvoiceItems';

import { VATService } from '../../../../domain/services/VATService';

import type { ApplyVatToInvoiceDTO } from './applyVatToInvoiceDTO';
import type { ApplyVatToInvoiceResponse } from './applyVatToInvoiceResponse';

export class ApplyVatToInvoiceUsecase
  implements
    UseCase<ApplyVatToInvoiceDTO, Promise<ApplyVatToInvoiceResponse>, Context> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private vatService: VATService
  ) {
    this.attachVatToApcItems = this.attachVatToApcItems.bind(this);
    this.updateInvoiceItems = this.updateInvoiceItems.bind(this);
    this.getInvoiceItems = this.getInvoiceItems.bind(this);
  }

  public async execute(
    request: ApplyVatToInvoiceDTO,
    context?: Context
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

    const execution = await new AsyncEither(invoiceId)
      .then(this.getInvoiceItems)
      .map(this.attachVatToApcItems(vat))
      .then(this.updateInvoiceItems)
      .execute();
    return execution;
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

  private attachVatToApcItems(vat: number) {
    return (invoiceItemsResult: InvoiceItem[]) => {
      return invoiceItemsResult
        .filter((item) => item.type === 'APC')
        .map((apcItem) => {
          apcItem.vat = vat;
          return apcItem;
        });
    };
  }
}
