/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../../core/domain/UseCase';
import { right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { PublishCreditNoteToErpResponse } from './publishCreditNoteToErpResponse';

import { CreditNote } from '../../../domain/CreditNote';
import { CreditNoteId } from '../../../domain/CreditNoteId';
import { CreditNoteRepoContract } from '../../../repos/creditNoteRepo';

import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { InvoiceId } from '../../../../invoices/domain/InvoiceId';
import { Invoice } from '../../../../invoices/domain/Invoice';
import { InvoiceRepoContract } from '../../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../../invoices/repos/invoiceItemRepo';

import { GetItemsForInvoiceUsecase } from '../../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
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
    private creditNoteRepo: CreditNoteRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
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

    let creditNote: CreditNote;
    let originalInvoice: Invoice;

    try {
      creditNote = await this.creditNoteRepo.getCreditNoteById(
        CreditNoteId.create(new UniqueEntityID(request.creditNoteId)).getValue()
      );
      this.loggerService.info('PublishCreditNoteToERP credit note', creditNote);

      originalInvoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(
          new UniqueEntityID(creditNote.invoiceId.toString())
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
          item.addAssignedCoupons(coupons);
          item.addAssignedWaivers(waivers);
        }
      }

      if (invoiceItems.length === 0) {
        throw new Error(`CreditNote ${creditNote.id} has no invoice items.`);
      }

      creditNote.addItems(invoiceItems);

      try {
        await this.creditNoteRepo.update(creditNote);
        this.loggerService.debug(
          'PublishCreditNoteToERP full credit note',
          creditNote
        );

        const erpData = {
          creditNote,
          originalInvoice,
        };

        const originalNSErpReference = originalInvoice
          .getErpReferences()
          .getItems()
          .filter(
            (er) => er.vendor === 'netsuite' && er.attribute === 'confirmation'
          )
          .find(Boolean);

        const isOriginalInvoiceRegistered = await this.erpService.checkInvoiceExists(
          originalNSErpReference.value
        );

        if (!isOriginalInvoiceRegistered) {
          const erpReference = ErpReferenceMap.toDomain({
            entity_id: creditNote.invoiceId.id.toString(),
            type: 'invoice',
            vendor: this.erpService.vendorName,
            attribute:
              this.erpService?.referenceMappings?.creditNote || 'creditNote',
            value: String('NONEXISTENT_INVOICE'),
          });
          await this.erpReferenceRepo.save(erpReference);

          return left(
            new UnexpectedError(
              'Non-existent invoice',
              `Referenced credit note's invoice having reference ${originalNSErpReference.value} does not exist in the ERP system.`
            )
          ); // this business is done
        }

        const erpResponse = await this.erpService.registerCreditNote(erpData);
        this.loggerService.info(
          `Updating credit note ${creditNote.id.toString()}: creditNoteReference -> ${JSON.stringify(
            erpResponse
          )}`
        );

        if (erpResponse) {
          const erpReference = ErpReferenceMap.toDomain({
            entity_id: creditNote.invoiceId.id.toString(),
            type: 'invoice',
            vendor: this.erpService.vendorName,
            attribute:
              this.erpService?.referenceMappings?.creditNote || 'creditNote',
            value: String(erpResponse),
          });
          await this.erpReferenceRepo.save(erpReference);
        }

        return right(erpResponse);
      } catch (err) {
        return left(err);
      }
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
