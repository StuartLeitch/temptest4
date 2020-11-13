/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../../core/domain/UseCase';
import { right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { PublishCreditNoteToErpResponse } from './publishCreditNoteToErpResponse';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { InvoiceId } from '../../../domain/InvoiceId';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { Invoice } from '../../../domain/Invoice';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';
import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';
import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';

export interface PublishCreditNoteToErpRequestDTO {
  creditNoteId?: string;
}

export class PublishCreditNoteToErpUsecase
  implements
    UseCase<
      PublishCreditNoteToErpRequestDTO,
      Promise<PublishCreditNoteToErpResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      PublishCreditNoteToErpRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private netSuiteService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request: PublishCreditNoteToErpRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<PublishCreditNoteToErpResponse> {
    this.loggerService.info('PublishCreditNoteToERP Request', request);

    let creditNote: Invoice;
    let originalInvoice: Invoice;

    try {
      creditNote = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.creditNoteId)).getValue()
      );
      this.loggerService.info('PublishCreditNoteToERP credit note', creditNote);

      originalInvoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(
          new UniqueEntityID(creditNote.cancelledInvoiceReference)
        ).getValue()
      );
      this.loggerService.info(
        'PublishCreditNoteToERP original invoice',
        originalInvoice
      );

      let invoiceItems = creditNote.invoiceItems.currentItems;
      this.loggerService.debug(
        'PublishCreditNoteToERP invoiceItems',
        invoiceItems
      );

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute({
          invoiceId: request.creditNoteId,
        });
        this.loggerService.debug(
          'PublishCreditNoteToERP getItemsUsecase response',
          resp
        );
        if (resp.isLeft()) {
          throw new Error(
            `CreditNote ${creditNote.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value.getValue();
        this.loggerService.debug(
          'PublishCreditNoteToERP invoice items',
          invoiceItems
        );

        for (const item of invoiceItems) {
          const [coupons, waivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
          ]);
          coupons.forEach((c) => item.addCoupon(c));
          item.waivers = waivers;
        }
      }

      if (invoiceItems.length === 0) {
        throw new Error(`CreditNote ${creditNote.id} has no invoice items.`);
      }

      creditNote.addItems(invoiceItems);

      try {
        const erpData = {
          creditNote,
          originalInvoice,
        };

        const netSuiteResponse = await this.netSuiteService.registerCreditNote(
          erpData
        );
        this.loggerService.info(
          `Updating credit note ${creditNote.id.toString()}: creditNoteReference -> ${JSON.stringify(
            netSuiteResponse
          )}`
        );

        this.loggerService.debug(
          'PublishCreditNoteToERP full credit note',
          creditNote
        );

        const erpReference = ErpReferenceMap.toDomain({
          entity_id: creditNote.invoiceId.id.toString(),
          type: 'creditNote',
          vendor: 'netsuite',
          attribute: 'creditNote',
          value: String(netSuiteResponse),
        });
        await this.erpReferenceRepo.save(erpReference);
        await this.invoiceRepo.update(creditNote);

        return right(netSuiteResponse);
      } catch (err) {
        return left(err);
      }
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
