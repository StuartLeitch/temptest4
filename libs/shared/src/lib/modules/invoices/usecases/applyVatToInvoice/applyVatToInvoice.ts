// * Core Domain
import { Result, Either, left, right } from '../../../../core/logic/Result';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { chain } from '../../../../core/logic/EitherChain';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceItem } from '../../domain/InvoiceItem';

import { ApplyVatToInvoiceDTO } from './applyVatToInvoiceDTO';
import { ApplyVatToInvoiceResponse } from './applyVatToInvoiceResponse';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';

import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { UpdateInvoiceItemsUsecase } from '../updateInvoiceItems';
import { InvoiceRepoContract } from '../../repos';

import { VATService } from '../../../../domain/services/VATService';

export type ApplyVatToInvoiceContext = AuthorizationContext<Roles>;

export class ApplyVatToInvoiceUsecase
  implements
    UseCase<
      ApplyVatToInvoiceDTO,
      Promise<ApplyVatToInvoiceResponse>,
      ApplyVatToInvoiceContext
    >,
    AccessControlledUsecase<
      ApplyVatToInvoiceDTO,
      ApplyVatToInvoiceContext,
      AccessControlContext
    > {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private vatService: VATService
  ) {}

  // @Authorize('payer:read')
  public async execute(
    request: ApplyVatToInvoiceDTO,
    context?: ApplyVatToInvoiceContext
  ): Promise<ApplyVatToInvoiceResponse> {
    const { payerType, invoiceId, country } = request;
    const vat = this.vatService.calculateVAT(
      country,
      payerType !== PayerType.INSTITUTION
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
      this.invoiceRepo
    );
    return await getItemsForInvoiceUsecase.execute({
      invoiceId
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
      .filter(item => item.type === 'APC')
      .map(apcItem => {
        apcItem.vat = vat;
        return apcItem;
      });
  }
}
