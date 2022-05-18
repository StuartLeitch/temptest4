import { UseCase } from '../../../../../core/domain/UseCase';
import { right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { LoggerContract } from '../../../../../infrastructure/logging';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { CreditNote } from '../../../domain/CreditNote';
import { CreditNoteId } from '../../../domain/CreditNoteId';
import { Invoice } from '../../../../invoices/domain/Invoice';
import { InvoiceRepoContract } from '../../../../invoices/repos/invoiceRepo';
import { CreditNoteRepoContract } from '../../../repos/creditNoteRepo';
import { InvoiceItemRepoContract } from '../../../../invoices/repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';
import { ErpReferenceRepoContract } from './../../../../vendors/repos/ErpReferenceRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { CatalogRepoContract } from '../../../../journals/repos';
import { JournalId } from '../../../../journals/domain/JournalId';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';

import { GetItemsForInvoiceUsecase } from '../../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetManuscriptByManuscriptIdUsecase } from './../../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetPublisherCustomValuesUsecase } from '../../../../publishers/usecases/getPublisherCustomValues';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { PublishCreditNoteToErpResponse as Response } from './publishCreditNoteToErpResponse';
import type { PublishCreditNoteToErpRequestDTO as DTO } from './publishCreditNoteToErpDTO';
import { InvoiceErpReferences } from '../../../../invoices/domain/InvoiceErpReferences';
import * as Errors from './publishCreditNoteToErp.errors';

export class PublishCreditNoteToErpUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private creditNoteRepo: CreditNoteRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private catalogRepo: CatalogRepoContract,
    private publisherRepo: PublisherRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();
  }

  @Authorize('erp:publish')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    this.loggerService.info('PublishCreditNoteToERP Request', request);
    let creditNote: CreditNote;
    let invoice: Invoice;

    const getPayerDetails = new GetPayerDetailsByInvoiceIdUsecase(
      this.payerRepo,
      this.loggerService
    );
    const getManuscript = new GetManuscriptByManuscriptIdUsecase(
      this.manuscriptRepo
    );
    const getPublisherCustomValue = new GetPublisherCustomValuesUsecase(
      this.publisherRepo
    );

    try {
      // * Get CreditNote details
      const maybeCreditNote = await this.creditNoteRepo.getCreditNoteById(
        CreditNoteId.create(new UniqueEntityID(request.creditNoteId))
      );

      if (maybeCreditNote.isLeft()) {
        return left(maybeCreditNote.value);
      }
      creditNote = maybeCreditNote.value;
      this.loggerService.info('PublishCreditNoteToERP Credit Note', creditNote);

      // * Get Invoice details
      const maybeInvoice = await this.invoiceRepo.getInvoiceById(
        creditNote.invoiceId
      );
      if (maybeInvoice.isLeft()) {
        return left(maybeInvoice.value);
      }
      invoice = maybeInvoice.value;
      this.loggerService.info(
        'PublishCreditNoteToERP Original Invoice',
        invoice
      );

      // * Get Invoice Items
      let invoiceItems = invoice?.invoiceItems?.currentItems;
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

        const resp = await getItemsUsecase.execute(
          {
            invoiceId: invoice.invoiceId.id.toString(),
          },
          context
        );
        this.loggerService.debug(
          'PublishCreditNoteToERP getItemsUsecase Response'
        );
        if (resp.isLeft()) {
          throw new Error(
            `The Invoice ${creditNote.invoiceId.id.toString()} has no invoice items`
          );
        }

        invoiceItems = resp.value;
        this.loggerService.debug(
          'PublishCreditNoteToERP Invoice Items',
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
        throw new Error(
          `Invoice ${creditNote.invoiceId.id.toString()} with Credit Note ${
            creditNote.id
          } has no invoice items.`
        );
      }

      invoice.addItems(invoiceItems);

      // * Get Manuscript
      const manuscriptId = invoiceItems[0].manuscriptId.id.toString();
      const maybeManuscript = await getManuscript.execute(
        { manuscriptId },
        context
      );
      if (maybeManuscript.isLeft()) {
        return left(
          new Errors.InvoiceManuscriptNotFoundError(
            invoice.invoiceId.toString()
          )
        );
      }

      const manuscript = maybeManuscript.value;

      // * Get Payer details
      const maybePayer = await getPayerDetails.execute(
        { invoiceId: invoice.invoiceId.toString() },
        context
      );
      if (maybePayer.isLeft()) {
        return left(
          new Errors.InvoicePayersNotFoundError(invoice.invoiceId.toString())
        );
      }
      const payer = maybePayer.value;

      // * Get address
      const maybeAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );
      if (maybeAddress.isLeft()) {
        throw new Error(`Invoice ${invoice.id} has no address associated.`);
      }
      const address = maybeAddress.value;

      // * Get catalog
      const maybeCatalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId))
      );

      if (maybeCatalog.isLeft()) {
        return left(
          new Errors.InvoiceCatalogNotFoundError(invoice.invoiceId.toString())
        );
      }

      const catalog = maybeCatalog.value;

      // * Get publisher custom values
      const maybePublisherCustomValue = await getPublisherCustomValue.execute(
        {
          publisherId: catalog.publisherId.id.toString(),
        },
        context
      );

      if (maybePublisherCustomValue.isLeft()) {
        return left(
          new Errors.InvoiceCatalogNotFoundError(invoice.invoiceId.toString())
        );
      }
      const publisherCustomValues = maybePublisherCustomValue.value;

      try {
        await this.invoiceRepo.update(invoice);
        this.loggerService.debug(
          'PublishCreditNoteToERP Full Credit Note with referenced Invoice Items',
          creditNote
        );

        const erpData = {
          creditNote,
          invoice,
          manuscript,
          billingAddress: address,
          payer,
          publisherCustomValues,
        };

        const maybeInvoiceErpReferences = invoice
          .getErpReferences()
          .getItems()
          .filter(
            (er) => er.vendor === 'netsuite' && er.attribute === 'confirmation'
          );

        const invoiceErpReferences =
          maybeInvoiceErpReferences.length !== 0 &&
          maybeInvoiceErpReferences.find(Boolean);

        if (maybeInvoiceErpReferences.length === 0) {
          const erpReference = ErpReferenceMap.toDomain({
            entity_id: creditNote.id.toString(),
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

          this.loggerService.info(
            `Referenced credit note's invoice with id ${creditNote.invoiceId.id.toString()} does not exist in the ERP system.`
          );

          return right(null);
        }

        if (
          invoiceErpReferences &&
          invoiceErpReferences.value === 'NON_INVOICEABLE'
        ) {
          const erpReference = ErpReferenceMap.toDomain({
            entity_id: creditNote.id.toString(),
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

          this.loggerService.info(
            `Credit Note for non-invoiceable Invoice with id ${creditNote.invoiceId.id.toString()} marked!`
          );

          return right(null);
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
      console.info(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
