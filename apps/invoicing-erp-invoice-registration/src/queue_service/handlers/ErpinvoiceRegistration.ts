import {
  UniqueEntityID,
  UnexpectedError,
  Invoice,
  InvoiceId,
  ErpReferenceMap,
  Manuscript,
  CatalogItem,
  JournalId,
  PayerType,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { EventHandler } from '../event-handler';

const ERP_INVOICE_REGISTRATION = 'ERPInvoiceRegistration';

export const ERPInvoiceRegistration: EventHandler<any> = {
  event: ERP_INVOICE_REGISTRATION,
  handler(context: Context) {
    return async (data: any): Promise<void> => {

      const {
        repos: {
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          payer: payerRepo,
          address: addressRepo,
          manuscript: manuscriptRepo,
          catalog: catalogRepo,
          publisher: publisherRepo,
          erpReference: erpReferenceRepo
        },
        services: {
          logger,
          vatService,
          exchangeRateService,
          erp: {
            netsuite
          }
        },
      } = context;
      const { invoiceId } = JSON.parse(data.Body);

      logger.setScope(`ERP invoice registration event: ${ERP_INVOICE_REGISTRATION}`);
      logger.info(`Register invoice `, invoiceId);

      let invoice: Invoice;

      try {
        // * Get invoice details
        const maybeInvoice = await invoiceRepo.getInvoiceById(
          InvoiceId.create(new UniqueEntityID(invoiceId))
        );

        if (maybeInvoice.isLeft()) {
          throw new Error(maybeInvoice.value.message);
        }
        invoice = maybeInvoice.value;
        logger.debug('invoice: ', invoice);

        // * Get invoice items
        let invoiceItems = invoice?.invoiceItems?.currentItems;

        if (invoiceItems.length === 0) {
          const maybeItems = await invoiceItemRepo.getItemsByInvoiceId(
            invoice.invoiceId
          );

          if (maybeItems.isLeft()) {
            throw new Error(maybeItems.value.message);
          }

          const items = maybeItems.value;
          logger.debug('invoice items', items);

          if (items.length === 0) {
            throw new Error(
              `Invoice ${invoice.id.toString()} does not have invoice items.`
            );
          }

          for (const item of items) {
            const [maybeCoupons, maybeWaivers] = await Promise.all([
              couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
              waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
            ]);

            if (maybeCoupons.isLeft()) {
              throw new Error(maybeCoupons.value.message);
            }

            if (maybeWaivers.isLeft()) {
              throw new Error(maybeWaivers.value.message);
            }

            item.addAssignedCoupons(maybeCoupons.value);
            item.addAssignedWaivers(maybeWaivers.value);
          }

          // * Populate invoiceItem with data retrieved from the repo
          invoiceItems = items;
        }

        if (invoiceItems.length === 0) {
          throw new Error(`Invoice ${invoice.id} has no invoice items.`);
        }

        invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));
        logger.debug(
          'invoice items',
          invoiceItems
        );

        // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
        if (invoice.getInvoiceTotal() <= 0) {
          const nonInvoiceableErpReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: 'netsuite',
            attribute:
              netsuite?.referenceMappings?.invoiceConfirmation ||
              'invoice',
            value: 'NON_INVOICEABLE',
          });

          if (nonInvoiceableErpReference.isLeft()) {
            throw new Error(nonInvoiceableErpReference.value.message);
          }

          await this.erpReferenceRepo.save(nonInvoiceableErpReference.value);

          logger.info(
            `PublishInvoiceToERP Flag invoice ${invoice.invoiceId.id.toString()} as NON_INVOICEABLE`,
            nonInvoiceableErpReference
          );

          return;
        }

        // * Get payer details
        const maybePayer = await payerRepo.getPayerByInvoiceId(
          invoice.invoiceId
        );

        if (maybePayer.isLeft()) {
          throw new Error(maybePayer.value.message);
        }

        const payer = maybePayer.value;
        logger.debug('payer', payer);

        if (!payer) {
          throw new Error(`Invoice ${invoice.id} has no payers.`);
        }

        // * Get address details
        const maybeAddress = await addressRepo.findById(
          payer.billingAddressId
        );
        if (maybeAddress.isLeft()) {
          throw new Error(`Invoice ${invoice.id} has no address associated.`);
        }
        const address = maybeAddress.value;
        logger.debug('address', address);

        // * Get manuscript details
        const APCs = invoiceItems.filter(
          (invoiceItem) => invoiceItem.type === 'APC'
        );

        const manuscripts: Manuscript[] = [];

        for (const invoiceItem of APCs) {
          const maybeManuscript = await manuscriptRepo.findById(
            invoiceItem.manuscriptId
          );

          if (maybeManuscript.isLeft()) {
            throw new Error(maybeManuscript.value.message);
          }

          manuscripts.push(maybeManuscript.value);
        }

        let [manuscript] = manuscripts;

        if (!manuscript) {
          throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
        }
        logger.debug('manuscript', manuscript);

        // * Get catalog details
        let catalog: CatalogItem;

        const maybeCatalog = await catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId))
        );

        if (maybeCatalog.isLeft()) {
          throw new Error(maybeCatalog.value.message);
        }

        catalog = maybeCatalog.value;

        if (!catalog) {
          throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
        }

        logger.debug('catalog', catalog);

        // * Get publisher custom values
        const maybePublisherCustomValues = await publisherRepo.getCustomValuesByPublisherId(
          catalog?.publisherId
        );
        if (maybePublisherCustomValues.isLeft()) {
          throw new Error(`Invoice ${invoice.id} has no publisher associated.`);
        }
        const publisherCustomValues = maybePublisherCustomValues.value;
        logger.debug(
          'publisher data',
          publisherCustomValues
        );

        const vatNote = vatService.getVATNote(
          {
            postalCode: address.postalCode,
            countryCode: address.country,
            stateCode: address.state,
          },
          payer.type !== PayerType.INSTITUTION,
          invoice.dateIssued
        );
        logger.debug('vatNote', vatNote);

        let finalExchangeRate = 1.42; // ! Average value for the last seven years
        if (invoice && invoice.dateIssued) {
          let exchangeRate = null;
          try {
            exchangeRate = await exchangeRateService.getExchangeRate(
              new Date(invoice.dateIssued),
              'USD'
            );
          } catch (error) {
            logger.error('Error retrieving exchangeRate', error);
          }
          if (exchangeRate?.exchangeRate) {
            finalExchangeRate = exchangeRate.exchangeRate;
          }
        }
        logger.debug('rate', finalExchangeRate);

        const erpData: any = {
          invoice,
          payer,
          items: invoiceItems,
          manuscript,
          billingAddress: address,
          journalName: catalog.journalTitle,
          vatNote,
          exchangeRate: finalExchangeRate,
          customSegmentId: publisherCustomValues.customSegmentId,
          itemId: publisherCustomValues.itemId,
        };

        // logger.debug('erpData', erpData);

        const erpResponse = await netsuite.registerInvoice(erpData);
        logger.info(
          `Netsuite response`,
          erpResponse
        );

        if (erpResponse) {
          // * Save ERP reference
          const erpPaymentReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: 'netsuite',
            attribute:
              netsuite?.referenceMappings?.invoiceConfirmation ||
              'invoice',
            value: String(erpResponse.tradeDocumentId),
          });

          if (erpPaymentReference.isLeft()) {
            throw new Error(erpPaymentReference.value.message);
          }

          await erpReferenceRepo.save(erpPaymentReference.value);
          logger.info(`Added ErpReference`, erpPaymentReference);
        }
      } catch (err) {
        console.error(err);
        throw new UnexpectedError(err, err.toString());
      }
    };
  },
};
