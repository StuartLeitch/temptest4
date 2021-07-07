import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { InvoiceId } from '../../../domain/InvoiceId';
import { Invoice } from '../../../domain/Invoice';

import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';

import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';

import { PublishCreditNoteToErpResponse as Response } from './publishCreditNoteToErpResponse';
import { PublishCreditNoteToErpRequestDTO as DTO } from './publishCreditNoteToErpDTO';

export class PublishCreditNoteToErpUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();
  }

  @Authorize('erp:publish')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    this.loggerService.info('PublishCreditNoteToERP Request', request);

    let creditNote: Invoice;
    let originalInvoice: Invoice;

    try {
      const creditNoteId = InvoiceId.create(
        new UniqueEntityID(request.creditNoteId)
      );

      const maybeCreditNote = await this.invoiceRepo.getInvoiceById(
        creditNoteId
      );

      if (maybeCreditNote.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCreditNote.value.message))
        );
      }

      creditNote = maybeCreditNote.value;

      this.loggerService.info('PublishCreditNoteToERP credit note', creditNote);

      const maybeOriginalInvoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(
          new UniqueEntityID(creditNote.cancelledInvoiceReference)
        )
      );

      if (maybeOriginalInvoice.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeOriginalInvoice.value.message))
        );
      }

      originalInvoice = maybeOriginalInvoice.value;

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

        const resp = await getItemsUsecase.execute(
          {
            invoiceId: request.creditNoteId,
          },
          context
        );
        this.loggerService.debug(
          'PublishCreditNoteToERP getItemsUsecase response',
          resp
        );
        if (resp.isLeft()) {
          throw new Error(
            `CreditNote ${creditNote.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value;
        this.loggerService.debug(
          'PublishCreditNoteToERP invoice items',
          invoiceItems
        );

        for (const item of invoiceItems) {
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
      }

      if (invoiceItems.length === 0) {
        throw new Error(`CreditNote ${creditNote.id} has no invoice items.`);
      }

      creditNote.addItems(invoiceItems);

      try {
        await this.invoiceRepo.update(creditNote);
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

          if (erpReference.isLeft()) {
            return left(
              new UnexpectedError(new Error(erpReference.value.message))
            );
          }

          await this.erpReferenceRepo.save(erpReference.value);

          return left(
            new UnexpectedError(
              new Error('Non-existent invoice'),
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

          if (erpReference.isLeft()) {
            return left(
              new UnexpectedError(new Error(erpReference.value.message))
            );
          }

          await this.erpReferenceRepo.save(erpReference.value);
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
