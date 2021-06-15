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
import { CreditNote } from '../../../domain/CreditNote';
import { CreditNoteId } from '../../../domain/CreditNoteId';
import { Invoice } from '../../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from '../../../../invoices/repos/invoiceRepo';
import { CreditNoteRepoContract } from '../../../repos/creditNoteRepo';
import { InvoiceItemRepoContract } from '../../../../invoices/repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';
import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';

import { GetItemsForInvoiceUsecase } from '../../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { PublishCreditNoteToErpRequestDTO } from './publishCreditNoteToErpDTO';
import { PublishCreditNoteToErpResponse } from './publishCreditNoteToErpResponse';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';

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
    private creditNoteRepo: CreditNoteRepoContract,
    private invoiceRepo: InvoiceRepoContract,
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

  public async execute(
    request: PublishCreditNoteToErpRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<PublishCreditNoteToErpResponse> {
    this.loggerService.info('PublishCreditNoteToERP Request', request);
    let creditNote: CreditNote;
    let invoice: Invoice;

    try {
      creditNote = await this.creditNoteRepo.getCreditNoteById(
        CreditNoteId.create(new UniqueEntityID(request.creditNoteId)).getValue()
      );
      this.loggerService.info('PublishCreditNoteToERP Credit Note', creditNote);

      invoice = await this.invoiceRepo.getInvoiceById(creditNote.invoiceId);
      this.loggerService.info(
        'PublishCreditNoteToERP Original Invoice',
        invoice
      );

      let invoiceItems = invoice.invoiceItems.currentItems;
      this.loggerService.debug(
        'PublishCreditNoteToERP Invoice Items',
        invoiceItems
      );

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const response = await getItemsUsecase.execute({
          invoiceId: creditNote.invoiceId.id.toString(),
        });
        this.loggerService.debug(
          'PublishCreditNoteToERP getItemsUsecase Response'
        );
        if (response.isLeft()) {
          throw new Error(
            `The Invoice ${creditNote.invoiceId.id.toString()} has no invoice items`
          );
        }

        invoiceItems = response.value.getValue();
        this.loggerService.debug(
          'PublishCreditNoteToERP Invoice Items',
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
        throw new Error(
          `Invoice ${creditNote.invoiceId.id.toString()} with Credit Note ${
            creditNote.id
          } has no invoice items.`
        );
      }

      invoice.addItems(invoiceItems);

      try {
        await this.invoiceRepo.update(invoice);
        this.loggerService.debug(
          'PublishCreditNoteToERP Full Credit Note with referenced Invoice Items',
          creditNote
        );

        const erpData = {
          creditNote,
          invoice,
        };

        const invoiceErpReference = invoice
          .getErpReferences()
          .getItems()
          .filter(
            (er) => er.vendor === 'netsuite' && er.attribute === 'confirmation'
          )
          .find(Boolean);

        const isInvoiceRegistered = await this.erpService.checkInvoiceExists(
          invoiceErpReference.value
        );

        if (!isInvoiceRegistered) {
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
              'Non-existent Invoice',
              `Referenced credit note's invoice having reference ${invoiceErpReference.value} does not exist in the ERP system.`
            )
          );
        }

        const erpResponse = await this.erpService.registerCreditNote(erpData);
        this.loggerService.info(
          `Updating credit note ${creditNote.id.toString()}: creditNoteReference -> ${JSON.stringify(
            erpResponse
          )}`
        );

        if (erpResponse) {
          const erpReference = ErpReferenceMap.toDomain({
            entity_id: creditNote.id.toString(),
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
      console.info(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
