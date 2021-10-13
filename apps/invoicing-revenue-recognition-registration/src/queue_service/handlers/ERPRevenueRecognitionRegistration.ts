import {
  UniqueEntityID,
  UnexpectedError,
  InvoiceId,
  ErpReferenceMap,
  Manuscript,
  JournalId,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { EventHandler } from '../event-handler';

import {
  RepoError,
  RepoErrorCode,
} from '../../../../../libs/shared/src/lib/infrastructure/RepoError';

const ERP_REVENUE_RECOGNITION_REGISTRATION =
  'ERPRevenueRecognitionRegistration';

export const ERPRevenueRecognitionRegistration: EventHandler<any> = {
  event: ERP_REVENUE_RECOGNITION_REGISTRATION,
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
          erpReference: erpReferenceRepo,
          creditNote: creditNoteRepo,
        },
        services: {
          logger,
          erp: { netsuite },
        },
      } = context;

      const { invoiceId } = data;

      logger.setScope(
        `ERP payment registration event: ${ERP_REVENUE_RECOGNITION_REGISTRATION}`
      );
      logger.info(`Register Revenue Recognition`, invoiceId);

      console.info(context);
      try {
        // * Get Invoice details
        const maybeInvoice = await invoiceRepo.getInvoiceById(
          InvoiceId.create(new UniqueEntityID(invoiceId))
        );

        if (maybeInvoice.isLeft()) {
          throw new UnexpectedError(new Error(maybeInvoice.value.message));
        }

        const invoice = maybeInvoice.value;
        logger.debug('invoice: ', invoice);

        // * Get Invoice Items

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
              `Invoice ${invoice.invoiceId.toString()} does not have invoice items.`
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
          throw new Error(
            `Invoice ${invoice.invoiceId.toString()} has no invoice items.`
          );
        }

        invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));
        logger.info('invoice items', invoiceItems);

        // * Get Payer details
        const maybePayer = await payerRepo.getPayerByInvoiceId(
          invoice.invoiceId
        );

        if (maybePayer.isLeft()) {
          throw new Error(maybePayer.value.message);
        }

        const payer = maybePayer.value;
        logger.debug('payer', payer);

        if (!payer) {
          throw new Error(
            `Invoice ${invoice.invoiceId.toString()} has no payers.`
          );
        }

        // * Get Address details
        const maybeAddress = await addressRepo.findById(payer.billingAddressId);
        if (maybeAddress.isLeft()) {
          throw new Error(maybeAddress.value.message);
        }

        const address = maybeAddress.value;
        logger.debug('address: ', address);

        if (!address) {
          throw new Error(
            `Invoice ${invoice.invoiceId.toString()} has no address associated`
          );
        }

        // * Get Manuscript details
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

        logger.debug('manuscripts', manuscripts);

        let [manuscript] = manuscripts;

        if (!manuscript) {
          throw new Error(
            `Invoice ${invoice.invoiceId.toString()} has no manuscripts associated.`
          );
        }

        // * If it's a credit note and the manuscript has been published
        const maybeCreditNote = await creditNoteRepo.getCreditNoteByInvoiceId(
          invoice.invoiceId
        );

        if (maybeCreditNote.isLeft()) {
          const err = maybeCreditNote.value;
          if (err instanceof RepoError) {
            if (err.code !== RepoErrorCode.ENTITY_NOT_FOUND) {
              throw new UnexpectedError(new Error(err.message));
            }
          } else {
            throw new UnexpectedError(new Error(err.message));
          }
        } else {
          const creditNote = maybeCreditNote.value;

          if (
            manuscript.datePublished &&
            creditNote.dateIssued.getTime() < manuscript.datePublished.getTime()
          ) {
            return;
          }
        }

        // * Get catalog details
        const maybeCatalog = await catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId))
        );

        if (maybeCatalog.isLeft()) {
          throw new Error(maybeCatalog.value.message);
        }

        const catalog = maybeCatalog.value;

        if (!catalog) {
          throw new Error(
            `Invoice ${invoice.invoiceId.toString()} has no catalog associated.`
          );
        }
        logger.debug('catalog', catalog);

        // * Get publisher custom values
        const maybePublisherCustomValues = await publisherRepo.getCustomValuesByPublisherId(
          catalog.publisherId
        );
        if (maybePublisherCustomValues.isLeft()) {
          throw new Error(maybePublisherCustomValues.value.message);
        }
        const publisherCustomValues = maybePublisherCustomValues.value;
        if (!publisherCustomValues) {
          throw new Error(
            `Invoice ${invoice.invoiceId.toString()} has no publishers associated.`
          );
        }
        logger.debug('publisherValues: ', publisherCustomValues);

        const invoiceItem = invoice.invoiceItems.getItems().shift();
        const { assignedCoupons, assignedWaivers, price } = invoiceItem;
        let netCharges = price;
        if (assignedCoupons?.length) {
          netCharges -= assignedCoupons.coupons.reduce(
            (acc, coupon) => acc + (coupon.reduction / 100) * price,
            0
          );
        }
        if (assignedWaivers?.length) {
          netCharges -= assignedWaivers.waivers.reduce(
            (acc, waiver) => acc + (waiver.reduction / 100) * price,
            0
          );
        }
        await invoiceRepo.update(invoice);

        // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
        if (netCharges <= 0) {
          const maybeNonInvoiceableErpReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: netsuite.vendorName,
            attribute:
              netsuite.referenceMappings?.invoiceConfirmation || 'invoice',
            value: 'NON_INVOICEABLE',
          });

          if (maybeNonInvoiceableErpReference.isLeft()) {
            throw new UnexpectedError(
              new Error(maybeNonInvoiceableErpReference.value.message)
            );
          }

          const nonInvoiceableErpReference =
            maybeNonInvoiceableErpReference.value;

          const maybeResult = await this.erpReferenceRepo.save(
            nonInvoiceableErpReference
          );

          if (maybeResult.isLeft()) {
            throw new UnexpectedError(new Error(maybeResult.value.message));
          }

          return;
        }

        // * Check for existing revenue recognition
        const existingRevenueRecognition = await netsuite.getExistingRevenueRecognition(
          invoice.persistentReferenceNumber,
          manuscript.customId
        );

        if (existingRevenueRecognition.count === 1) {
          const maybeErpReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: netsuite.vendorName,
            attribute:
              netsuite?.referenceMappings?.revenueRecognition ||
              'revenueRecognition',
            value: String(existingRevenueRecognition.id),
          });

          if (maybeErpReference.isLeft()) {
            throw new Error(maybeErpReference.value.message);
          }

          const erpReference = maybeErpReference.value;
          const maybeSaveResult = await erpReferenceRepo.save(erpReference);

          if (maybeSaveResult.isLeft()) {
            throw new UnexpectedError(new Error(maybeSaveResult.value.message));
          }

          return;
        }

        // * Register Revenue Recognition
        const erpResponse = await netsuite.registerRevenueRecognition({
          manuscript,
          invoice,
          payer,
          publisherCustomValues,
          invoiceTotal: netCharges,
        });
        logger.debug('ERP Response', erpResponse);

        if (erpResponse?.journal?.id) {
          logger.info(
            `ERP Revenue Recognized Invoice ${invoice.invoiceId.toString()}: revenueRecognitionReference -> ${JSON.stringify(
              erpResponse
            )}`
          );
          const maybeErpReference = ErpReferenceMap.toDomain({
            entity_id: invoice.invoiceId.id.toString(),
            type: 'invoice',
            vendor: netsuite.vendorName,
            attribute:
              netsuite?.referenceMappings?.revenueRecognition ||
              'revenueRecognition',
            value: String(erpResponse?.journal.id),
          });

          if (maybeErpReference.isLeft()) {
            throw new Error(maybeErpReference.value.message);
          }

          const erpReference = maybeErpReference.value;
          const maybeSaveResult = await erpReferenceRepo.save(erpReference);

          if (maybeSaveResult.isLeft()) {
            throw new UnexpectedError(new Error(maybeSaveResult.value.message));
          }
        }
        logger.info(
          `ERP Revenue Recognized Invoice ${invoice.invoiceId.toString()}: Saved ERP refence -> ${JSON.stringify(
            erpResponse
          )}`
        );
      } catch (error) {
        throw new UnexpectedError(error, error.toString());
      }
    };
  },
};
