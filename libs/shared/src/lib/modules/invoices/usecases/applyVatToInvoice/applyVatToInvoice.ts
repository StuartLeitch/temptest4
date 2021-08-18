// * Core Domain
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * Usecase specific
import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceItem } from '../../domain/InvoiceItem';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { UpdateInvoiceItemsUsecase } from '../updateInvoiceItems';

import { VATService } from '../../../../domain/services/VATService';

import type { ApplyVatToInvoiceResponse as Response } from './applyVatToInvoiceResponse';
import type { ApplyVatToInvoiceDTO as DTO } from './applyVatToInvoiceDTO';

export class ApplyVatToInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private vatService: VATService
  ) {
    super();

    this.attachVatToApcItems = this.attachVatToApcItems.bind(this);
    this.updateInvoiceItems = this.updateInvoiceItems.bind(this);
    this.getInvoiceItems = this.getInvoiceItems.bind(this);
  }

  @Authorize('invoice:applyVAT')
  public async execute(request: DTO, context?: Context): Promise<Response> {
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
      .then(this.getInvoiceItems(context))
      .map(this.attachVatToApcItems(vat))
      .then(this.updateInvoiceItems(context))
      .execute();
    return execution;
  }

  private getInvoiceItems(context: Context) {
    return async (invoiceId: string) => {
      const getItemsForInvoiceUsecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );
      return await getItemsForInvoiceUsecase.execute(
        {
          invoiceId,
        },
        context
      );
    };
  }

  private updateInvoiceItems(context: Context) {
    return async (invoiceItems: InvoiceItem[]) => {
      const updateInvoiceItemsUsecase = new UpdateInvoiceItemsUsecase(
        this.invoiceItemRepo
      );
      return await updateInvoiceItemsUsecase.execute({ invoiceItems }, context);
    };
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
